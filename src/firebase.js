js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"; import {   getAuth,   signInWithEmailAndPassword,   onAuthStateChanged,   createUserWithEmailAndPassword,   signOut,   updatePassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"; import {   getDatabase,   ref,   onValue,   get,   set,   update,   push,   remove,   serverTimestamp,   runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";  import { APP } from "./config.js";  export const app = initializeApp(APP.firebaseConfig); export const auth = getAuth(app); export const db = getDatabase(app);  *// Auth helpers*  export {   signInWithEmailAndPassword,   onAuthStateChanged,   createUserWithEmailAndPassword,   signOut,   updatePassword };  export {   ref, onValue, get, set, update, push, remove, serverTimestamp, runTransaction };  

---
