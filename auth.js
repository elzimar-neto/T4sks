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
            await setDoc(doc(db, "users", result.user.email), {
                uid: result.user.uid,
                nome: result.user.displayName,
                email: result.user.email,
                foto: result.user.photoURL,
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (e) { console.error(e); }
    };
}

onAuthStateChanged(auth, (user) => {
    const isLogin = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    if (user && isLogin) window.location.href = "dashboard.html";
    if (!user && !isLogin) window.location.href = "index.html";
});