// ====================== LOGIN.JS ===========================
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const checkAccessButton = document.getElementById('checkAccessButton');
    const errorMessages = document.getElementById('errorMessages');
    const showPassword = document.getElementById('showPassword');

    const SERVER_URL = "http://localhost:3000"; // Server base URL

    // ---------------------- SHOW/HIDE PASSWORD ----------------------
    showPassword?.addEventListener('click', () => {
        if (!passwordInput) return;
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });

    // ---------------------- LOGIN BUTTON ----------------------
    checkAccessButton?.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            return showError("Username and Password are required.");
        }

        try {
            // ---------------- ONLINE LOGIN ----------------
            const response = await fetch(`${SERVER_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) throw new Error("Server unreachable or login failed");

            const data = await response.json();

            if (!data || data.error) throw new Error(data.error || "Invalid credentials");

            handleLoginSuccess(data.user, false);

        } catch (err) {
            console.warn("Server login failed:", err.message);

            // ---------------- OFFLINE LOGIN ----------------
            if (window.profileSync) {
                const offlineUser = window.profileSync.getLocalUserList().find(u =>
                    (u.username === username || u.email === username) && u.password === password
                );

                if (offlineUser) {
                    handleLoginSuccess(offlineUser, true);
                    return;
                }
            }

            showError("Login failed. Server unreachable or credentials incorrect.");
        }
    });

    // ---------------------- HELPER FUNCTIONS ----------------------
    function handleLoginSuccess(user, offline = false) {
        if (window.profileSync) window.profileSync.setLocalUser(user);
        errorMessages.style.color = "lime";
        errorMessages.textContent = offline
            ? "Offline login successful! Redirecting..."
            : "Login successful! Redirecting...";

        setTimeout(() => {
            window.location.href = "profile.html";
        }, 500);
    }

    function showError(msg) {
        if (!errorMessages) return;
        errorMessages.style.color = "red";
        errorMessages.textContent = msg;
    }
});
