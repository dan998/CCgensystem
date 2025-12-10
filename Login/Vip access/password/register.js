// ====================== REGISTER.JS ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.profileSync) {
        console.error("profile-sync.js not loaded!");
        return;
    }

    const profileSync = window.profileSync;

    const usernameInput = document.getElementById("newUsername");
    const emailInput    = document.getElementById("newEmail");
    const passwordInput = document.getElementById("newPassword");
    const phoneInput    = document.getElementById("newPhone");
    const securityQ     = document.getElementById("securityQuestion");
    const securityA     = document.getElementById("securityAnswer");
    const registerBtn   = document.getElementById("registerBtn");
    const registerMsg   = document.getElementById("registerMsg");

    const SERVER_URL = "http://localhost:3000"; // server base URL

    // -------------------- REGISTER --------------------
    registerBtn?.addEventListener("click", async () => {
        const username = usernameInput?.value.trim();
        const email    = emailInput?.value.trim();
        const password = passwordInput?.value;
        const phone    = phoneInput?.value.trim();
        const question = securityQ?.value.trim();
        const answer   = securityA?.value.trim();

        if (!username || !email || !password || !question || !answer) {
            showMessage("Please fill all fields.", "red");
            return;
        }

        // Load existing users locally
        let users = profileSync.getLocalUserList();
        if (users.find(u => u.username === username)) {
            showMessage("Username already exists!", "red");
            return;
        }
        if (users.find(u => u.email === email)) {
            showMessage("Email already registered!", "red");
            return;
        }

        const newUser = {
            username,
            email,
            password,
            phone: phone || "",
            securityQuestion: question,
            securityAnswer: answer,
            profilePic: "",
            loginHistory: []
        };

        // ---------------- SAVE LOCALLY ----------------
        profileSync.setLocalUser(newUser);

        // ---------------- TRY SERVER SYNC ----------------
        try {
            const response = await fetch(`${SERVER_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser)
            });

            if (!response.ok) throw new Error("Server unreachable");

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            showMessage("Registration successful! Redirecting to login...", "lime");
            setTimeout(() => window.location.href = "login.html", 1000);

        } catch (err) {
            console.warn("Server registration failed, offline mode enabled:", err.message);
            showMessage("Registration saved locally. Connect to server later to sync.", "orange");
            setTimeout(() => window.location.href = "login.html", 1500);
        }
    });

    function showMessage(msg, color) {
        if (!registerMsg) return;
        registerMsg.textContent = msg;
        registerMsg.style.color = color || "red";
    }
});
