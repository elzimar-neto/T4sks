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

// Lógica do Clique
const btnGoogle = document.getElementById('btn-google');
if (btnGoogle) {
    btnGoogle.onclick = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Salva no banco e força o redirecionamento manual após salvar
            await setDoc(doc(db, "users", user.email), {
                uid: user.uid,
                nome: user.displayName,
                email: user.email,
                foto: user.photoURL,
                lastLogin: serverTimestamp()
            }, { merge: true });

            console.log("Login realizado!");
            window.location.href = "dashboard.html"; // Redirecionamento forçado manual

        } catch (error) {
            console.error("Erro no Auth:", error);
            alert("Erro ao entrar. Verifique se os domínios estão autorizados no Firebase.");
        }
    };
}

// Monitor de estado (Caso o usuário já esteja logado ao abrir o site)
onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || path === '';

    if (user && isLoginPage) {
        window.location.assign("dashboard.html");
    }
    if (!user && path.includes('dashboard.html')) {
        window.location.assign("index.html");
    }
});