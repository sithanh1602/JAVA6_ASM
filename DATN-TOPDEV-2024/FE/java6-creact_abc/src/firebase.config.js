// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage"; // Import Storage SDK nếu muốn dùng storage

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCxbXSDC2NwA-ZB-8sNR6wXZUQEwCLDRhY",
    authDomain: "datn-buildpc.firebaseapp.com",
    projectId: "datn-buildpc",
    storageBucket: "datn-buildpc.firebasestorage.app",
    messagingSenderId: "444522016574",
    appId: "1:444522016574:web:cc1ca00247e81fde50466f",
    measurementId: "G-1DN5DB8GQS"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = getStorage(app);

export { app, storage };
