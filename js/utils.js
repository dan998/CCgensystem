// ================= RSA ENCRYPT =================
function encryptData(payload) {
    const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuZCw2fkcoY6pHLjcJHDf
d+d2UunfQ3tKc/obu+tSS+uN76OaOKCDNylRinA9PvNYkGUArKeHdXwQhhoYIVSx
5UxPK+oS39UHCr9YsekUXrHNa8K0mAXd+6hPIiuA8nAUnBYQ32VDVHilIgnVenj8
uI+QYiq0Nnv/cTUqSww74rdQ7x9IrND9q1NZM2GARm6f6WPP8aV+pUIBrs/Lp/6L
+ra83lasJu9VB+LXVNA7KMiC7Mx7HiNlzS5jxGr4ilSKFGO0rxyl2za4ji60yzbM
YnKOQFMnMrhSfk+5npBu4aUHR+j+m5XXSTC/BiujxjFDZhZxtHbastNQRC5qB372
EwIDAQAB
-----END PUBLIC KEY-----
`;

    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(publicKey);

    const encrypted = encryptor.encrypt(JSON.stringify(payload));
    if (!encrypted) throw new Error("Encryption failed");

    return encrypted;
}

// ================= Local Storage =================
function getLocalDB() {
    return JSON.parse(localStorage.getItem("loggedUsersDB")) || { users: [] };
}

function saveLocalDB(db) {
    localStorage.setItem("loggedUsersDB", JSON.stringify(db));
}

// ================= Referral Code =================
function generateReferralCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// ================= Country & Flag =================
async function getUserCountry() {
    try {
        const res = await fetch("https://ipapi.co/json");
        const data = await res.json();

        return {
            country: data.country_name || "Unknown",
            flag: data.country_code ? getFlagEmoji(data.country_code) : ""
        };
    } catch {
        return { country: "Unknown", flag: "" };
    }
}

function getFlagEmoji(countryCode) {
    return countryCode
        .toUpperCase()
        .replace(/./g, char =>
            String.fromCodePoint(127397 + char.charCodeAt())
        );
     }
