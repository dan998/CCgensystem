window.addEventListener("DOMContentLoaded", () => {
    const db = getLocalDB();
    
    // Get the last logged-in user
    const user = db.users[db.users.length - 1];
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Display user info
    document.getElementById("welcomeUser").innerText = `Welcome, ${user.username}`;
    document.getElementById("userReferral").innerText = user.referralCode;
    document.getElementById("referredBy").innerText = user.referredBy || "None";
    document.getElementById("userCountry").innerText = user.country;
    document.getElementById("userFlag").innerText = user.flag;

    // Filter users who used this user's referral code
    const referredUsers = db.users.filter(u => u.referredBy === user.referralCode);
    document.getElementById("refCount").innerText = referredUsers.length;

    // Display each referred user with country + flag
    const refUsersList = document.getElementById("refUsersList");
    refUsersList.innerHTML = ""; // clear previous list
    referredUsers.forEach(u => {
        const li = document.createElement("li");
        li.textContent = `${u.username} - ${u.country} ${u.flag}`;
        refUsersList.appendChild(li);
    });

    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
        window.location.href = "login.html";
    });
});