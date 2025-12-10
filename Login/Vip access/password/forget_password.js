// ================= FORGOT PASSWORD.JS ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.profileSync) return console.error("profile-sync.js not loaded!");
    const profileSync = window.profileSync;
    const SERVER_URL = "http://localhost:3000";

    const usernameInput = document.getElementById("fpUsername");
    const securityQInput = document.getElementById("fpSecurityQuestion");
    const securityAInput = document.getElementById("fpSecurityAnswer");
    const newPasswordInput = document.getElementById("fpNewPassword");
    const resetBtn = document.getElementById("resetBtn");
    const fpMsg = document.getElementById("fpMsg");

    let activeUser = null;

    usernameInput?.addEventListener("blur", async () => {
        const username = usernameInput.value.trim();
        if (!username) return;

        // Offline first
        let users = profileSync.getLocalUserList();
        activeUser = users.find(u => u.username === username);

        // Online fallback
        if (!activeUser && navigator.onLine) {
            try {
                const res = await fetch(`${SERVER_URL}/getUser?username=${encodeURIComponent(username)}`);
                const data = await res.json();
                if (data.user) {
                    activeUser = data.user;
                    profileSync.setLocalUser(activeUser);
                }
            } catch (err) {
                console.warn("Server unreachable, using offline only.");
            }
        }

        securityQInput.value = activeUser?.securityQuestion || "";
    });

    resetBtn?.addEventListener("click", async () => {
        if (!activeUser) return showMessage("Username not found!", "red");

        const answer = securityAInput.value.trim();
        const newPass = newPasswordInput.value;
        if (!answer || !newPass) return showMessage("Please fill all fields.", "red");
        if (answer !== activeUser.securityAnswer) return showMessage("Security answer is incorrect!", "red");

        // Update locally
        activeUser.password = newPass;
        profileSync.setLocalUser(activeUser);

        // Attempt server sync
        if (navigator.onLine) {
            try {
                await fetch(`${SERVER_URL}/updateUser`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: activeUser.username, data: activeUser })
                });
            } catch (err) {
                console.warn("Server sync failed, saved locally.");
            }
        }

        showMessage("Password reset successful! Redirecting...", "lime");
        setTimeout(() => window.location.href = "login.html", 1000);
    });

    function showMessage(msg, color) {
        if (!fpMsg) return;
        fpMsg.textContent = msg;
        fpMsg.style.color = color || "red";
    }
});
