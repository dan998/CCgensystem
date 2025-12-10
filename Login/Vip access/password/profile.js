document.addEventListener("DOMContentLoaded", async () => {
    if (!window.profileSync) {
        console.error("profile-sync.js not loaded!");
        return;
    }

    const profileSync = window.profileSync;

    // -------------------- DOM --------------------
    const profileUsername     = document.getElementById("profileUsername");
    const profileEmail        = document.getElementById("profileEmail");
    const profilePhone        = document.getElementById("profilePhone");
    const profilePic          = document.getElementById("profilePic");
    const profilePicUpdate    = document.getElementById("profilePicUpdate");
    const profilePicInput     = document.getElementById("profilePicInput");
    const updateProfileBtn    = document.getElementById("updateProfileBtn");
    const profileMsg          = document.getElementById("profileMsg");

    const currentPassword     = document.getElementById("currentPassword");
    const newPassword         = document.getElementById("newPassword");
    const confirmPassword     = document.getElementById("confirmPassword");
    const updatePasswordBtn   = document.getElementById("updatePasswordBtn");
    const securityMsg         = document.getElementById("securityMsg");

    const ipAddressEl         = document.getElementById("ipAddress");
    const webrtcIPsEl         = document.getElementById("webrtcIPs");
    const deviceInfoEl        = document.getElementById("deviceInfo");
    const countryEl           = document.getElementById("country");
    const networkEl           = document.getElementById("network");
    const sidebarUsername     = document.getElementById("sidebarUsername");
    const statusBadge         = document.getElementById("statusBadge");
    const logoutBtn           = document.getElementById("logoutBtn");
    const ccGenBtn            = document.getElementById("ccGenBtn");

    // -------------------- TAB SWITCH --------------------
    const tabs = document.querySelectorAll(".tab");
    const menuItems = document.querySelectorAll(".menu ul li[data-tab]");

    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            tabs.forEach(tab => tab.classList.remove("active"));
            const tabToShow = document.getElementById(item.dataset.tab);
            tabToShow && tabToShow.classList.add("active");
        });
    });

    // -------------------- LOAD ACTIVE USER --------------------
    let activeUser = profileSync.getLocalUser();
    if (!activeUser) return (window.location.href = "login.html");

    profileUsername && (profileUsername.value = activeUser.username || "");
    profileEmail && (profileEmail.value = activeUser.email || "");
    profilePhone && (profilePhone.value = activeUser.phone || "");
    profilePic && (profilePic.src = activeUser.profilePic || "default-avatar.png");
    profilePicUpdate && (profilePicUpdate.src = activeUser.profilePic || "default-avatar.png");
    sidebarUsername && (sidebarUsername.textContent = activeUser.username || "Username");

    // -------------------- DASHBOARD FEATURES --------------------
    async function fetchDeviceData() {
        // Public IP via external API
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            ipAddressEl && (ipAddressEl.textContent = data.ip || "Unknown");
        } catch {
            ipAddressEl && (ipAddressEl.textContent = "Unavailable");
        }

        // Device Info
        deviceInfoEl && (deviceInfoEl.textContent = navigator.userAgent);

        // Optional: fetch country/network info
        try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            countryEl && (countryEl.textContent = data.country_name || "Unknown");
            networkEl && (networkEl.textContent = data.org || "Unknown");
        } catch {
            countryEl && (countryEl.textContent = "Unknown");
            networkEl && (networkEl.textContent = "Unknown");
        }
    }

    fetchDeviceData();

    // WebRTC IPs
    async function fetchWebRTC() {
        try {
            const ips = await profileSync.getWebRTCIPs();
            webrtcIPsEl && (webrtcIPsEl.textContent = ips.join(", ") || "None");

            activeUser.webrtcIPs = ips;
            profileSync.setLocalUser(activeUser);
        } catch (err) {
            console.error("WebRTC IP error:", err);
        }
    }

    fetchWebRTC();

    // -------------------- PROFILE UPDATE --------------------
    updateProfileBtn?.addEventListener("click", () => {
        if (!activeUser) return;

        // Update phone
        if (profilePhone) activeUser.phone = profilePhone.value.trim();

        // Update profile picture
        if (profilePicInput?.files?.length > 0) {
            const reader = new FileReader();
            reader.onload = e => {
                activeUser.profilePic = e.target.result;
                profilePic && (profilePic.src = e.target.result);
                profilePicUpdate && (profilePicUpdate.src = e.target.result);

                profileSync.setLocalUser(activeUser);
                profileSync.syncToServer();

                profileMsg && (profileMsg.textContent = "Profile updated successfully!");
                setTimeout(() => (profileMsg.textContent = ""), 3000);
            };
            reader.readAsDataURL(profilePicInput.files[0]);
        } else {
            profileSync.setLocalUser(activeUser);
            profileSync.syncToServer();
            profileMsg && (profileMsg.textContent = "Profile updated successfully!");
            setTimeout(() => (profileMsg.textContent = ""), 3000);
        }
    });

    // -------------------- SECURITY --------------------
    updatePasswordBtn?.addEventListener("click", () => {
        if (!activeUser) return;

        const current = currentPassword?.value || "";
        const newPass = newPassword?.value || "";
        const confirm = confirmPassword?.value || "";

        if (current !== activeUser.password) {
            securityMsg && (securityMsg.textContent = "Current password is incorrect!");
            return;
        }
        if (newPass !== confirm) {
            securityMsg && (securityMsg.textContent = "New passwords do not match!");
            return;
        }
        if (!newPass) {
            securityMsg && (securityMsg.textContent = "New password cannot be empty!");
            return;
        }

        activeUser.password = newPass;

        profileSync.setLocalUser(activeUser);
        profileSync.syncToServer();

        securityMsg && (securityMsg.textContent = "Password updated successfully!");
        setTimeout(() => (securityMsg.textContent = ""), 3000);

        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
    });

    // -------------------- LOGOUT --------------------
    logoutBtn?.addEventListener("click", () => {
        profileSync.logout();
    });

    // -------------------- CC GENERATOR NAVIGATION --------------------
    ccGenBtn?.addEventListener("click", () => {
        window.location.href = "cc-generator.html";
    });

    // -------------------- STATUS BADGE --------------------
    function updateStatus() {
        if (!statusBadge) return;
        if (navigator.onLine) {
            statusBadge.textContent = "Online";
            statusBadge.style.background = "limegreen";
        } else {
            statusBadge.textContent = "Offline";
            statusBadge.style.background = "orange";
        }
    }

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

});