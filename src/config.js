js

export const APP = {   *// Kamu isi ini dari Firebase console*    firebaseConfig: {     apiKey: "PASTE_YOUR_API_KEY",     authDomain: "PASTE_YOUR_AUTH_DOMAIN",     databaseURL: "PASTE_YOUR_DATABASE_URL",     projectId: "PASTE_YOUR_PROJECT_ID"   },     *// suffix supaya user login pakai username (bukan email)*    emailSuffix: "@ayo.local",     *// DEV bootstrap code (untuk bikin admin/owner awal)*    devSetup: {     code: "AYOBANGUN_SETUP_2026",     admin: { username: "admin", password: "0000" },     owner: { username: "owner", password: "owner123" }   } };  

---
