document.getElementById("loginBtn").addEventListener("click", async () => {
    const loginInput = document.getElementById("loginUser").value.trim();
    const loginPass = document.getElementById("loginPass").value.trim();

    const payload = encryptData({ loginInput, loginPass });

    try {
        const res = await fetch("http://localhost:3000/secure-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload })
        });
        const result = await res.json();
        if (result.ok) {
            const db = getLocalDB();
            const userExists = db.users.some(u => u.username === result.user.username);
            if (!userExists) db.users.push(result.user);
            saveLocalDB(db);
            window.location.href = "dashboard.html";
        } else {
            alert("Login failed: " + result.error);
        }
    } catch {
        alert("Server unavailable. Login failed.");
    }
});

document.getElementById("forgotBtn").addEventListener("click", () => {
    window.location.href = "forgot_password.html";
});