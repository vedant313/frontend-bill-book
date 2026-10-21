import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTpsXejwGBxNisM6QykBVgGDAw0CSSX4",
  authDomain: "nexa-bills.firebaseapp.com",
  projectId: "nexa-bills",
  storageBucket: "nexa-bills.firebasestorage.app",
  messagingSenderId: "647837112463",
  appId: "1:647837112463:web:946f54afbce8a5b40678fa",
  measurementId: "G-4ZVR56HJUX",
};

const app = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
