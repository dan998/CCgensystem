// ====================== FORGOT PASSWORD.JS ===========================
document.addEventListener("DOMContentLoaded", () => {
    if (!window.profileSync) {
        console.error("profile-sync.js not loaded!");
        return;
    }

    const profileSync = window.profileSync;
    const SERVER_URL = "http://localhost:3000"; // Server base URL

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
        const localUsers = profileSync.getLocalUserList();
        activeUser = localUsers.find(u => u.username === username);

        // If not found locally and online, fetch from server
        if (!activeUser && navigator.onLine) {
            try {
                const response = await fetch(`${SERVER_URL}/users/${encodeURIComponent(username)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        activeUser = data.user;
                        // Save to local storage for offline use
                        profileSync.setLocalUser(activeUser);
                    }
                }
            } catch (err) {
                console.warn("Unable to fetch user from server:", err.message);
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

        // Attempt server sync if online
        if (navigator.onLine) {
            try {
                const response = await fetch(`${SERVER_URL}/users/${encodeURIComponent(activeUser.username)}/update-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ password: newPass })
                });

                if (!response.ok) throw new Error("Server update failed");
            } catch (err) {
                console.warn("Server sync failed, password saved locally:", err.message);
            }
        }

        showMessage("Password reset successful! Redirecting to login...", "lime");
        setTimeout(() => window.location.href = "login.html", 1000);
    });

    function showMessage(msg, color) {
        if (!fpMsg) return;
        fpMsg.textContent = msg;
        fpMsg.style.color = color || "red";
    }
});
