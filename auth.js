import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOHWpGPcdUEXuPopdZd16qQTDHKd-R994",
  authDomain: "t4sks-af64e.firebaseapp.com",
  projectId: "t4sks-af64e",
  storageBucket: "t4sks-af64e.firebasestorage.app",
  messagingSenderId: "1069050787483",
  appId: "1:1069050787483:web:04ac9c6780764ec14ef83e"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const btnGoogle = document.getElementById('btn-google');

// Função de Login
btnGoogle.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Salva o usuário no Firestore para controle de projetos futuros
        await setDoc(doc(db, "users", user.uid), {
            nome: user.displayName,
            email: user.email,
            foto: user.photoURL,
            lastLogin: new Date()
        }, { merge: true });

        // Redireciona para a tela do Kanban (vamos criar no próximo passo)
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Erro no login:", error);
        alert("Erro ao entrar com Google. Verifique o console.");
    }
});

// Verifica se já está logado
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname.includes('index.html')) {
        window.location.href = "dashboard.html";
    }
});