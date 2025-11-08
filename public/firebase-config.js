// Firebase Configuration
// Replace these values with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyA03rSNwKpphz4c3tGMYAOBpOluythmv7s",
    authDomain: "bppowerplay-26.firebaseapp.com",
    projectId: "bppowerplay-26",
    storageBucket: "bppowerplay-26.firebasestorage.app",
    messagingSenderId: "482761423779",
    appId: "1:482761423779:web:504bcbc2df7c33f0587816",
    measurementId: "G-VH5TJFG1HL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

