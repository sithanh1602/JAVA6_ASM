// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Import Storage SDK nếu muốn dùng storage

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAN-RGe3mwtkaxc-or6D0GWBxheUA08PD4",
    authDomain: "anhduanxuong.firebaseapp.com",
    projectId: "anhduanxuong",
    storageBucket: "anhduanxuong.appspot.com",
    messagingSenderId: "580326984513",
    appId: "1:580326984513:web:0fb61d5c9c2b0fe94cefc0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { app, storage };
