// ================= REGISTER.JS ===========================
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.profileSync) {
        console.error("profile-sync.js not loaded!");
        return;
    }

    const profileSync = window.profileSync;
    const SERVER_URL = "http://localhost:3000"; // server base URL

    const usernameInput = document.getElementById("newUsername");
    const emailInput    = document.getElementById("newEmail");
    const passwordInput = document.getElementById("newPassword");
    const phoneInput    = document.getElementById("newPhone");
    const countrySelect = document.getElementById("newCountry");
    const securityQ     = document.getElementById("securityQuestion");
    const securityA     = document.getElementById("securityAnswer");
    const registerBtn   = document.getElementById("registerBtn");
    const registerMsg   = document.getElementById("registerMsg");

    // Load countries
    try {
        const response = await fetch("./countries.json");
        const countries = await response.json();
        countries.forEach(c => {
            const option = document.createElement("option");
            option.value = c;
            option.textContent = c;
            countrySelect.appendChild(option);
        });
    } catch (err) {
        console.error("Failed to load countries.json:", err);
    }

    // ---------------- AUTO SYNC FUNCTION ----------------
    async function syncLocalUsersToServer() {
        if (!navigator.onLine) return;

        const users = profileSync.getLocalUserList();
        for (let user of users) {
            if (user.synced) continue;
            try {
                const res = await fetch(`${SERVER_URL}/updateUser`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user.username, data: user })
                });
                if (!res.ok) throw new Error("Server registration failed");

                user.synced = true;
                profileSync.setLocalUser(user);
                console.log(`User ${user.username} synced to server`);
            } catch (err) {
                console.warn(`Failed to sync ${user.username}:`, err.message);
            }
        }
    }

    syncLocalUsersToServer();
    window.addEventListener("online", syncLocalUsersToServer);

    // -------------------- REGISTER BUTTON --------------------
    registerBtn?.addEventListener("click", async () => {
        const username = usernameInput?.value.trim();
        const email    = emailInput?.value.trim();
        const password = passwordInput?.value;
        const phone    = phoneInput?.value.trim();
        const country  = countrySelect?.value || "";
        const question = securityQ?.value.trim();
        const answer   = securityA?.value.trim();

        if (!username || !email || !password || !question || !answer || !country)
            return showMessage("Please fill all required fields.", "red");

        if (phone && !/^\+?\d{6,15}$/.test(phone)) return showMessage("Invalid phone number.", "red");

        const users = profileSync.getLocalUserList();
        if (users.find(u => u.username === username)) return showMessage("Username exists!", "red");
        if (users.find(u => u.email === email)) return showMessage("Email exists!", "red");

        const newUser = {
            username, email, password, phone, country,
            securityQuestion: question, securityAnswer: answer,
            profilePic: "", loginHistory: [], synced: false
        };

        profileSync.setLocalUser(newUser);
        await syncLocalUsersToServer();

        if (newUser.synced) {
            showMessage("Registration successful! Redirecting to login...", "lime");
        } else {
            showMessage("Saved locally. Will sync when online.", "orange");
        }
        setTimeout(() => window.location.href = "login.html", 1500);
    });

    function showMessage(msg, color) {
        if (!registerMsg) return;
        registerMsg.textContent = msg;
        registerMsg.style.color = color || "red";
    }
});
