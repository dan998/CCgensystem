document.getElementById("registerBtn").addEventListener("click", async () => {
    const username = document.getElementById("regUsername").value.trim();
    const gmail = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const securityQ = document.getElementById("regSecurityQ").value.trim();
    const securityA = document.getElementById("regSecurityA").value.trim();
    const referralInput = document.getElementById("regReferral").value.trim();

    // Fetch country and flag automatically
    const { country, flag } = await getUserCountry();
    const referralCode = generateReferralCode();

    const newUser = {
        username,
        gmail,
        phone,
        password,
        securityQ,
        securityA,
        referralCode,
        referredBy: referralInput || null,
        country,
        flag,
        createdAt: new Date().toISOString()
    };

    // Save locally
    const db = getLocalDB();

    // Check if username, email or phone already exists
    const exists = db.users.some(u => u.username === username || u.gmail === gmail || u.phone === phone);
    if (exists) {
        return alert("Username, email or phone already exists!");
    }

    db.users.push(newUser);
    saveLocalDB(db);

    alert(`Registered successfully! Your referral code is: ${referralCode}`);
    window.location.href = "login.html";
});