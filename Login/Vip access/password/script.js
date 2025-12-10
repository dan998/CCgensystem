// ================= LOGIN.JS ===========================
document.addEventListener('DOMContentLoaded', async () => {
    if (!window.profileSync) return console.error("profile-sync.js not loaded!");

    const profileSync = window.profileSync;
    const SERVER_URL = "http://localhost:3000";

    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const checkAccessButton = document.getElementById('checkAccessButton');
    const errorMessages = document.getElementById('errorMessages');

    checkAccessButton?.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        if (!username || !password) return showError("Username and Password required.");

        // Offline check
        let users = profileSync.getLocalUserList();
        let user = users.find(u => u.username === username);

        // Online fallback
        if (!user && navigator.onLine) {
            try {
                const res = await fetch(`${SERVER_URL}/getUser?username=${encodeURIComponent(username)}`);
                const data = await res.json();
                if (data.user) {
                    user = data.user;
                    profileSync.setLocalUser(user);
                }
            } catch (err) {
                console.warn("Server unreachable, using offline only.");
            }
        }

        if (!user || user.password !== password) return showError("Invalid username or password.");

        profileSync.setLocalUser(user); // mark active user
        errorMessages.style.color = "lime";
        errorMessages.textContent = "Login successful! Redirecting...";
        setTimeout(() => window.location.href = "profile.html", 500);
    });

    function showError(msg) {
        if (!errorMessages) return;
        errorMessages.style.color = "red";
        errorMessages.textContent = msg;
    }
});
