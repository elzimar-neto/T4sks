import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.onclick = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await setDoc(doc(db, "users", user.email), {
                uid: user.uid,
                nome: user.displayName,
                email: user.email,
                foto: user.photoURL,
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (error) { console.error("Erro no login:", error); }
    };
}

onAuthStateChanged(auth, (user) => {
    const isLoginPath = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    if (user && isLoginPath) window.location.href = "dashboard.html";
    if (!user && !isLoginPath) window.location.href = "index.html";
});