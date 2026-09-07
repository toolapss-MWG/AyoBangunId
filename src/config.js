export const APP = {
  // Kamu isi ini dari Firebase console
  const firebaseConfig = {
  apiKey: "AIzaSyBntT312d0m0VFSPkqiDVUomflUWzcKVB4",
  authDomain: "ayobangun-contractor.firebaseapp.com",
  projectId: "ayobangun-contractor",
  storageBucket: "ayobangun-contractor.firebasestorage.app",
  messagingSenderId: "1099399042051",
  appId: "1:1099399042051:web:764118e26a6cc479956a36",
  measurementId: "G-01F0KBG41D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

  // suffix supaya user login pakai username (bukan email)
  emailSuffix: "@ayo.local",

  // DEV bootstrap code (untuk bikin admin/owner awal)
  devSetup: {
    code: "AYOBANGUN_SETUP_2026",
    admin: { username: "admin", password: "0000" },
    owner: { username: "owner", password: "owner123" }
  }
};
