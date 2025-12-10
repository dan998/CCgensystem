// ====================== LOGIN.JS ===========================
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.profileSync) return console.error("profile-sync.js not loaded!");

    const usernameInput = document.getElementById('usernameInput');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const checkAccessButton = document.getElementById('checkAccessButton');
    const errorMessages = document.getElementById('errorMessages');
    const showPassword = document.getElementById('showPassword');

    showPassword?.addEventListener('click', () => {
        if (!passwordInput) return;
        passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    });

    checkAccessButton?.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            return showError("Username and Password are required.");
        }

        try {
            const user = await window.profileSync.login(username, password);
            if (!user) return showError("Login failed. Incorrect username or password.");

            window.profileSync.setLocalUser(user);
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