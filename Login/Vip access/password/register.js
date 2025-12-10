// ====================== REGISTER.JS (Offline + Auto-Sync) ===========================
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.profileSync) {
        console.error("profile-sync.js not loaded!");
        return;
    }

    const profileSync = window.profileSync;
    const SERVER_URL = "http://localhost:3000"; // server base URL

    const usernameInput = document.getElementById("newUsername");
    const emailInput    = document.getElementById("newEmail");
    const passwordInput = document.getElementById("newPassword");
    const phoneInput    = document.getElementById("newPhone");
    const countrySelect = document.getElementById("newCountry");
    const securityQ     = document.getElementById("securityQuestion");
    const securityA     = document.getElementById("securityAnswer");
    const registerBtn   = document.getElementById("registerBtn");
    const registerMsg   = document.getElementById("registerMsg");

    // ---------------- LOAD COUNTRIES FROM JSON ----------------
    try {
        const response = await fetch("./countries.json");
        const countries = await response.json();
        countries.forEach(c => {
            const option = document.createElement("option");
            option.value = c;
            option.textContent = c;
            countrySelect.appendChild(option);
        });
    } catch (err) {
        console.error("Failed to load countries.json:", err);
    }

    // -------------------- REGISTER BUTTON --------------------
    registerBtn?.addEventListener("click", async () => {
        const username = usernameInput?.value.trim();
        const email    = emailInput?.value.trim();
        const password = passwordInput?.value;
        const phone    = phoneInput?.value.trim();
        const country  = countrySelect?.value || "";
        const question = securityQ?.value.trim();
        const answer   = securityA?.value.trim();

        // Validate required fields
        if (!username || !email || !password || !question || !answer || !country) {
            return showMessage("Please fill all required fields.", "red");
        }

        // Validate phone number
        if (phone && !/^\+?\d{6,15}$/.test(phone)) {
            return showMessage("Invalid phone number.", "red");
        }

        // Check duplicates locally
        const users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.find(u => u.username === username)) {
            return showMessage("Username already exists!", "red");
        }
        if (users.find(u => u.email === email)) {
            return showMessage("Email already registered!", "red");
        }

        const newUser = {
            username,
            email,
            password,
            phone: phone || "",
            country,
            securityQuestion: question,
            securityAnswer: answer,
            profilePic: "",
            loginHistory: [],
            lastSession: null
        };

        // Save locally & queue sync
        profileSync.setLocalUser(newUser);
        await profileSync.syncToServer();

        // Check if synced
        const local = profileSync.getLocalUser();
        if (local) {
            showMessage("Registration successful! Redirecting to login...", "lime");
            setTimeout(() => window.location.href = "login.html", 1000);
        } else {
            showMessage("Saved locally. Will sync when online.", "orange");
            setTimeout(() => window.location.href = "login.html", 1500);
        }
    });

    // -------------------- HELPER --------------------
    function showMessage(msg, color) {
        if (!registerMsg) return;
        registerMsg.textContent = msg;
        registerMsg.style.color = color || "red";
    }
});