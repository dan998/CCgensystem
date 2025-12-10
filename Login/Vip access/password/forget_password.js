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

        let users = JSON.parse(localStorage.getItem("users")) || [];
        activeUser = users.find(u => u.username === username);

        if (!activeUser && navigator.onLine) {
            activeUser = await profileSync.fetchUserFromServer(username);
        }

        if (activeUser) {
            securityQInput.value = activeUser.securityQuestion || "";
        } else {
            securityQInput.value = "";
        }
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

        activeUser.password = newPass;
        profileSync.setLocalUser(activeUser);
        await profileSync.syncToServer();

        showMessage("Password reset successful! Redirecting to login...", "lime");
        setTimeout(() => window.location.href = "login.html", 1000);
    });

    function showMessage(msg, color) {
        if (!fpMsg) return;
        fpMsg.textContent = msg;
        fpMsg.style.color = color || "red";
    }
});