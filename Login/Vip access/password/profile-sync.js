// ====================== profile-sync.js (UPGRADED) ===========================
// Features added:
// - public IP detection (api.ipify.org fallback)
// - device info (userAgent, platform, screen, language)
// - optional geolocation (navigator.geolocation) with permission
// - record lastSession on login (time, publicIP, localIPs, device, geo)
// - append to loginHistory and auto-sync to server (when online)
// - preserves existing offline-first behavior and users.json seeding

const SERVER_BASE = "http://localhost:3000";

// LOCAL STORAGE KEYS
const LS_ACTIVE = "loggedInUser";
const LS_USERS  = "users";          // all users offline
const LS_QUEUE  = "syncQueue";      // offline updates waiting to sync

// ---------------------- INIT USERS FROM JSON ----------------------
(async function initUsers() {
    const existing = JSON.parse(localStorage.getItem(LS_USERS)) || [];
    if (existing.length === 0) {
        try {
            const res = await fetch("users.json");
            const users = await res.json();
            localStorage.setItem(LS_USERS, JSON.stringify(users));
            console.log("Loaded users.json into localStorage");
        } catch(e) {
            console.warn("users.json not found, skipping initial load.");
        }
    }
})();

// ---------------------- UTILITIES ----------------------
function safeJSONParse(v, fallback = null) {
    try { return JSON.parse(v); } catch { return fallback; }
}

function getLocalUser() {
    try { return JSON.parse(localStorage.getItem(LS_ACTIVE)) || null; }
    catch { return null; }
}

function setLocalUser(user) {
    if (!user || !user.username) return;
    localStorage.setItem(LS_ACTIVE, JSON.stringify(user));

    let users = safeJSONParse(localStorage.getItem(LS_USERS), []) || [];
    const idx = users.findIndex(u => u.username === user.username);
    if (idx >= 0) users[idx] = { ...users[idx], ...user };
    else users.push(user);
    localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function mergeUser(oldU = {}, newU = {}) {
    return {
        ...oldU,
        ...newU,
        loginHistory: [
            ...(oldU.loginHistory || []),
            ...(newU.loginHistory || [])
        ].slice(-200) // keep last 200 entries max
    };
}

function queueSync(username, data) {
    if (!username) return;
    let queue = safeJSONParse(localStorage.getItem(LS_QUEUE), []) || [];
    queue.push({ username, data, time: Date.now() });
    localStorage.setItem(LS_QUEUE, JSON.stringify(queue));
}

// ---------------------- SERVER HELPERS ----------------------
async function serverGetUser(username) {
    if (!username) return null;
    try {
        const res = await fetch(`${SERVER_BASE}/getUser?username=${encodeURIComponent(username)}`);
        const json = await res.json();
        return json?.user || null;
    } catch (err) {
        // console.warn("serverGetUser failed", err);
        return null;
    }
}

async function serverUpdateUser(username, data) {
    if (!username || !data) return null;
    try {
        const res = await fetch(`${SERVER_BASE}/updateUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, data })
        });
        const json = await res.json();
        return json?.user || null;
    } catch (err) {
        // console.warn("serverUpdateUser failed", err);
        return null;
    }
}

// ---------------------- SYNC QUEUE ----------------------
async function flushSyncQueue() {
    if (!navigator.onLine) return false;

    let queue = safeJSONParse(localStorage.getItem(LS_QUEUE), []) || [];
    if (!queue.length) return true;

    const remaining = [];
    for (const item of queue) {
        const updated = await serverUpdateUser(item.username, item.data);
        if (!updated) remaining.push(item);
    }

    localStorage.setItem(LS_QUEUE, JSON.stringify(remaining));
    return remaining.length === 0;
}

// ---------------------- MAIN SYNC ----------------------
async function syncToServer() {
    const local = getLocalUser();
    if (!local?.username) return null;

    await flushSyncQueue();
    if (!navigator.onLine) return null;

    const serverUser = await serverGetUser(local.username);
    if (!serverUser) {
        const uploaded = await serverUpdateUser(local.username, local);
        if (uploaded) setLocalUser(uploaded);
        return uploaded;
    }

    const merged = mergeUser(serverUser, local);
    const updated = await serverUpdateUser(local.username, merged);
    if (updated) setLocalUser(updated);
    return updated;
}

// ---------------------- FETCH ON LOGIN ----------------------
async function fetchUserFromServer(username) {
    if (!navigator.onLine || !username) return null;

    const serverUser = await serverGetUser(username);
    if (!serverUser) return null;

    const local = getLocalUser();
    const merged = mergeUser(local || {}, serverUser);
    setLocalUser(merged);
    return merged;
}

// ---------------------- NETWORK & DEVICE INFO UTILITIES ----------------------

// Public IP (api.ipify.org) — falls back gracefully
async function getPublicIP(timeout = 4000) {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
        clearTimeout(id);
        const json = await res.json();
        return json?.ip || null;
    } catch {
        return null;
    }
}

// Device info summary
function getDeviceInfo() {
    try {
        return {
            userAgent: navigator.userAgent || null,
            platform: navigator.platform || null,
            language: navigator.language || null,
            screen: {
                width: window.screen?.width || null,
                height: window.screen?.height || null,
                pixelRatio: window.devicePixelRatio || 1
            },
            vendor: navigator.vendor || null,
            online: navigator.onLine
        };
    } catch {
        return null;
    }
}

// Geolocation (asks user permission) — returns null if denied/unavailable
function getGeoLocation(timeout = 8000) {
    return new Promise(resolve => {
        if (!("geolocation" in navigator)) return resolve(null);

        const done = (pos) => resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
        });

        const fail = () => resolve(null);

        let handled = false;
        const id = setTimeout(() => {
            if (!handled) { handled = true; resolve(null); }
        }, timeout);

        navigator.geolocation.getCurrentPosition(
            (p) => { if (!handled) { handled = true; clearTimeout(id); done(p); } },
            (e) => { if (!handled) { handled = true; clearTimeout(id); fail(e); } },
            { enableHighAccuracy: true, maximumAge: 0, timeout }
        );
    });
}

// ---------------------- WEBRTC IPS ----------------------
function getWebRTCIPs(timeout = 3000) {
    return new Promise(resolve => {
        const ips = new Set();
        let pc;
        try {
            pc = new RTCPeerConnection({ iceServers: [] });
        } catch (e) {
            return resolve([]);
        }

        const finish = () => {
            try { pc.close(); } catch {}
            resolve([...ips]);
        };

        pc.onicecandidate = e => {
            if (!e.candidate) return;
            const parts = e.candidate.candidate.split(" ");
            const ip = parts[4];
            if (ip) ips.add(ip);
        };

        try {
            pc.createDataChannel("");
            pc.createOffer()
              .then(o => pc.setLocalDescription(o))
              .catch(() => finish());
        } catch {
            finish();
        }

        setTimeout(finish, timeout);
    });
}

// ---------------------- LOGIN (ENHANCED) ----------------------
async function login(username, password, { captureLocation = false } = {}) {
    username = (username || "").trim();
    if (!username) throw new Error("username required");

    // 1) Try server (if online) — fetch latest user then check password
    if (navigator.onLine) {
        const serverUser = await fetchUserFromServer(username);
        if (serverUser && serverUser.password === password) {
            // record session metadata
            await recordLoginSession(serverUser, { captureLocation });
            return getLocalUser() || serverUser;
        }
    }

    // 2) Offline fallback from local users
    const localUsers = safeJSONParse(localStorage.getItem(LS_USERS), []) || [];
    const localUser = localUsers.find(u => u.username === username && u.password === password);
    if (localUser) {
        await recordLoginSession(localUser, { captureLocation, isLocal: true });
        return localUser;
    }

    return null;
}

// ---------------------- RECORD LOGIN SESSION ----------------------
async function recordLoginSession(user, { captureLocation = false, isLocal = false } = {}) {
    if (!user || !user.username) return;

    // Collect telemetry in parallel (non-blocking-ish)
    const [publicIP, localIPsPromise, device] = await Promise.all([
        getPublicIP().catch(() => null),
        getWebRTCIPs().catch(() => []),
        Promise.resolve(getDeviceInfo())
    ]);

    // get geo optionally (may prompt)
    let geo = null;
    if (captureLocation) {
        try { geo = await getGeoLocation().catch(() => null); } catch {}
    }

    const session = {
        time: Date.now(),
        publicIP: publicIP || null,
        localIPs: localIPsPromise || [],
        device: device || null,
        geo: geo || null,
        source: isLocal ? "local" : "server"
    };

    // append into loginHistory (keep most recent first)
    const local = safeJSONParse(localStorage.getItem(LS_ACTIVE)) || null;
    const userObj = local && local.username === user.username ? local : user;

    userObj.loginHistory = userObj.loginHistory || [];
    userObj.loginHistory.push(session);
    // keep only recent 200
    if (userObj.loginHistory.length > 200) userObj.loginHistory = userObj.loginHistory.slice(-200);

    // set lastSession for easy access
    userObj.lastSession = session;

    // save locally and queue sync
    setLocalUser(userObj);

    // If online try to sync immediately; else queue for later
    if (navigator.onLine) {
        const updated = await serverUpdateUser(userObj.username, userObj);
        if (!updated) queueSync(userObj.username, userObj);
    } else {
        queueSync(userObj.username, userObj);
    }
}

// ---------------------- LOGOUT ----------------------
function logout() {
    localStorage.removeItem(LS_ACTIVE);
    window.location.href = "login.html";
}

// ---------------------- AUTO-SYNC ----------------------
window.addEventListener("online", () => {
    // try to flush queue and sync active user
    flushSyncQueue().catch(()=>{});
    (async ()=> {
        try { await syncToServer(); } catch {}
    })();
});

// Export to window
window.profileSync = {
    getLocalUser,
    setLocalUser,
    syncToServer,
    fetchUserFromServer,
    login,
    logout,
    getWebRTCIPs,
    // new helpers
    getPublicIP,
    getDeviceInfo,
    getGeoLocation,
    recordLoginSession
};