// ---------------- UTILS ----------------

// RSA Encrypt
function encryptData(data) {
    const publicKey = `-----BEGIN PUBLIC KEY-----
PASTE_YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----`;
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(JSON.stringify(data));
}

// LocalStorage functions
function getLocalDB() {
    return JSON.parse(localStorage.getItem("loggedUsersDB")) || { users: [] };
}
function saveLocalDB(db) {
    localStorage.setItem("loggedUsersDB", JSON.stringify(db));
}

// Generate referral code
function generateReferralCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Get country & flag using IP API
async function getUserCountry() {
    try {
        const res = await fetch('https://ipapi.co/json');
        const data = await res.json();
        return {
            country: data.country_name,
            flag: data.country_code ? getFlagEmoji(data.country_code) : ''
        };
    } catch {
        return { country: 'Unknown', flag: '' };
    }
}

function getFlagEmoji(countryCode) {
    return countryCode.toUpperCase().replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt())
    );
}

// Get country & flag using IP API
async function getUserCountry() {
    try {
        const res = await fetch('https://ipapi.co/json'); // public IP geolocation
        const data = await res.json();
        return {
            country: data.country_name || "Unknown",
            flag: data.country_code ? getFlagEmoji(data.country_code) : ""
        };
    } catch {
        return { country: 'Unknown', flag: '' };
    }
}

// Convert country code to emoji flag
function getFlagEmoji(countryCode) {
    return countryCode.toUpperCase().replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt())
    );
}