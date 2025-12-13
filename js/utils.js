// ================= RSA ENCRYPT =================
function encryptData(payload) {
    const publicKey = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAozJYLo5I4>
VFQgXLZUWzVi5zF2CoYvJuJ+RRXZq3/KR4c7DiMPyw3yVX4mtlgs9>
aTuCmSyKB5WrsXjd4wP29ceifvyLfsAfH3eAHrkD5aYZdWm3gbcJd>
KU8dC2CaE2czWTFCsaSFQb/qSdHPUfZusH1tUxecxF3M6KWAF2J4/>
pzTfNCcagCxjtGBUuZS5N5XSFsf76VcIyeM4b14chvcwyabTozJTM>
zU5FIXALhjwCdm/Q+y551YXpswGUvzLog8AnJL8S1LRair+LGEW0f>
2wIDAQAB
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
