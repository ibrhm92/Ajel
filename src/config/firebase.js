// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ضع بيانات مشروعك من Firebase Console هنا
const firebaseConfig = {
  apiKey: "AIzaSyBQWUL12hqCr_Lg3LTRyLnc17N2e0nv4oo",
  authDomain: "ajel-13731.firebaseapp.com",
  projectId: "ajel-13731",
  storageBucket: "ajel-13731.firebasestorage.app",
  messagingSenderId: "34281946556",
  appId: "1:34281946556:web:67372e80338668d687bfb9",
  measurementId: "G-J4LV4EQ1HH",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
