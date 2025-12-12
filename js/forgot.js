const forgotUserInput = document.getElementById("forgotUser");
const fetchQuestionBtn = document.getElementById("fetchQuestionBtn");
const securitySection = document.getElementById("securitySection");
const securityQuestionEl = document.getElementById("securityQuestion");
const securityAnswerInput = document.getElementById("securityAnswer");
const newPasswordInput = document.getElementById("newPassword");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");

let currentUser = null;

// Step 1: Fetch security question
fetchQuestionBtn.addEventListener("click", () => {
    const input = forgotUserInput.value.trim();
    if (!input) return alert("Please enter your username or email");

    const db = getLocalDB();
    currentUser = db.users.find(u => u.username === input || u.gmail === input);

    if (!currentUser) return alert("User not found");

    // Show the security question
    securityQuestionEl.innerText = `Security Question: ${currentUser.securityQ}`;
    securitySection.style.display = "block"; // reveal the answer input
});

// Step 2: Reset password
resetPasswordBtn.addEventListener("click", () => {
    if (!currentUser) return alert("Please fetch your security question first");

    const answer = securityAnswerInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    if (!answer || !newPassword) return alert("Please fill in all fields");

    if (answer !== currentUser.securityA) return alert("Incorrect security answer");

    // Update password in localStorage
    const db = getLocalDB();
    db.users = db.users.map(u => u.username === currentUser.username ? { ...u, password: newPassword } : u);
    saveLocalDB(db);

    alert("Password successfully reset!");
    window.location.href = "login.html";
});