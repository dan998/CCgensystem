// ====================== LOGIN.JS (Offline + Auto-Sync) ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.profileSync) {
        console.error("profile-sync.js not loaded!");
        return;
    }

    const profileSync = window.profileSync;

    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const checkAccessButton = document.getElementById('checkAccessButton');
    const errorMessages = document.getElementById('errorMessages');
    const showPassword = document.getElementById('showPassword');

    // Toggle password visibility
    showPassword?.addEventListener('click', () => {
        if (!passwordInput) return;
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });

    // Login
    checkAccessButton?.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            return showError("Username and Password are required.");
        }

        try {
            const user = await profileSync.login(username, password, { captureLocation: true });
            if (!user) return showError("Login failed. Incorrect username or password.");

            errorMessages.style.color = "lime";
            errorMessages.textContent = "Login successful! Redirecting...";

            setTimeout(() => {
                window.location.href = "profile.html";
            }, 500);

        } catch (err) {
            console.error(err);
            showError("Unable to reach server. Working offline mode.");
        }
    });

    function showError(msg) {
        if (!errorMessages) return;
        errorMessages.style.color = "red";
        errorMessages.textContent = msg;
    }
});