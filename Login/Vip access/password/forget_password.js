// ====================== FORGOT-PASSWORD.JS (Offline + Auto-Sync) ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.profileSync) {
        console.error("profile-sync.js not loaded!");
        return;
    }

    const profileSync = window.profileSync;

    const usernameInput = document.getElementById("fpUsername");
    const securityQInput = document.getElementById("fpSecurityQuestion");
    const securityAInput = document.getElementById("fpSecurityAnswer");
    const newPasswordInput = document.getElementById("fpNewPassword");
    const resetBtn = document.getElementById("resetBtn");
    const fpMsg = document.getElementById("fpMsg");

    let activeUser = null;

    // -------------------- FETCH USER --------------------
    usernameInput?.addEventListener("blur", async () => {
        const username = usernameInput.value.trim();
        if (!username) return;

        // Try offline first
        const users = JSON.parse(localStorage.getItem("users")) || [];
        activeUser = users.find(u => u.username === username);

        // If not found locally and online, fetch from server
        if (!activeUser && navigator.onLine) {
            try {
                activeUser = await profileSync.fetchUserFromServer(username);
            } catch (err) {
                console.warn("Failed to fetch user from server:", err.message);
            }
        }

        // Populate security question if user exists
        securityQInput.value = activeUser?.securityQuestion || "";
    });

    // -------------------- RESET PASSWORD --------------------
    resetBtn?.addEventListener("click", async () => {
        if (!activeUser) {
            showMessage("Username not found!", "red");
            return;
        }

        const answer = securityAInput?.value.trim();
        const newPass = newPasswordInput?.value;

        if (!answer || !newPass) {
            showMessage("Please fill all fields.", "red");
            return;
        }

        if (answer !== activeUser.securityAnswer) {
            showMessage("Security answer is incorrect!", "red");
            return;
        }

        // Update password locally
        activeUser.password = newPass;
        profileSync.setLocalUser(activeUser);

        // Queue sync to server
        try {
            await profileSync.syncToServer();
        } catch (err) {
            console.warn("Server offline, password saved locally:", err.message);
        }

        showMessage("Password reset successful! Redirecting to login...", "lime");
        setTimeout(() => window.location.href = "login.html", 1000);
    });

    // -------------------- HELPER --------------------
    function showMessage(msg, color) {
        if (!fpMsg) return;
        fpMsg.textContent = msg;
        fpMsg.style.color = color || "red";
    }
});