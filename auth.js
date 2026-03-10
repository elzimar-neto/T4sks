import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOHWpGPcdUEXuPopdZd16qQTDHKd-R994",
    authDomain: "t4sks-af64e.firebaseapp.com",
    projectId: "t4sks-af64e",
    storageBucket: "t4sks-af64e.firebasestorage.app",
    messagingSenderId: "1069050787483",
    appId: "1:1069050787483:web:04ac9c6780764ec14ef83e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.onclick = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Erro Google Auth:", error);
            alert("Erro ao entrar com Google. Verifique se o domínio 127.0.0.1 ou localhost está autorizado no Firebase.");
        }
    };
}

onAuthStateChanged(auth, (user) => {
    const isLoginPath = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    if (user && isLoginPath) window.location.href = "dashboard.html";
    if (!user && !isLoginPath) window.location.href = "index.html";
});