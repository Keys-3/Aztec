// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDy9pVeXldauscuIsifmbOVIA5E3UodurI",
    authDomain: "aztec-7c8a6.firebaseapp.com",
    projectId: "aztec-7c8a6",
    storageBucket: "aztec-7c8a6.firebasestorage.app",
    messagingSenderId: "452817622982",
    appId: "1:452817622982:web:f3fb0219622133e7b584c7",
    measurementId: "G-W2V4MCQKEE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);