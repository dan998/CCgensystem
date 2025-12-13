document.getElementById("loginBtn").addEventListener("click", async () => {
    const loginInput = document.getElementById("loginUser").value.trim();
    const loginPass = document.getElementById("loginPass").value.trim();

    try {
        const res = await fetch("http://CCgensystem.arkanafaisal.my.id:3000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({usernameOrEmail: loginInput, password: loginPass})
        });
        const result = await res.json();
        if (result.ok) {
            alert('login successfull')
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
