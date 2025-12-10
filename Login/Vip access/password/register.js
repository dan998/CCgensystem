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

        let users = JSON.parse(localStorage.getItem("users")) || [];
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

        // Save locally
        profileSync.setLocalUser(newUser);

        // Try to sync to server
        await profileSync.syncToServer();

        showMessage("Registration successful! Redirecting to login...", "lime");
        setTimeout(() => window.location.href = "login.html", 1000);
    });

    function showMessage(msg, color) {
        if (!registerMsg) return;
        registerMsg.textContent = msg;
        registerMsg.style.color = color || "red";
    }
});