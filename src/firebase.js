import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5r2-poTjpIJP3-DpbsEFT6YhndC45fm4",
  authDomain: "nexsa-bills.firebaseapp.com",
  projectId: "nexsa-bills",
  storageBucket: "nexsa-bills.firebasestorage.app",
  messagingSenderId: "647837112463",
  appId: "1:647837112463:web:946f54afbce8a5b40678fa",
  measurementId: "G-4ZVR56HJUX",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
