import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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

// Elementos
const btnGoogle = document.getElementById('btn-google');
const btnContinue = document.getElementById('btn-continue');
const emailInput = document.getElementById('email-field');
const linkRegistrar = document.getElementById('link-registrar');

// 1. Login com Google
btnGoogle.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        await registrarUsuarioNoFirestore(result.user);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Erro Google:", error);
        alert("Erro ao entrar com Google.");
    }
});

// 2. Login/Inscrição com E-mail
btnContinue.addEventListener('click', async () => {
    const email = emailInput.value;
    if (!email || email.length < 5) {
        alert("Por favor, digite um e-mail válido.");
        return;
    }

    const password = prompt("Digite sua senha:");
    if (!password) return;

    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await registrarUsuarioNoFirestore(result.user);
        window.location.href = "dashboard.html";
    } catch (error) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            const signup = confirm("Usuário não encontrado. Deseja criar uma conta agora?");
            if (signup) {
                const res = await createUserWithEmailAndPassword(auth, email, password);
                await registrarUsuarioNoFirestore(res.user);
                window.location.href = "dashboard.html";
            }
        } else {
            alert("Erro: " + error.message);
        }
    }
});

// 3. Link de Inscrição (simula o clique no Google para facilitar)
linkRegistrar.addEventListener('click', (e) => {
    e.preventDefault();
    btnGoogle.click();
});

// Função para salvar no Firestore
async function registrarUsuarioNoFirestore(user) {
    await setDoc(doc(db, "users", user.uid), {
        nome: user.displayName || emailInput.value.split('@')[0],
        email: user.email,
        foto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`,
        updatedAt: new Date()
    }, { merge: true });
}

// Observador de Sessão
onAuthStateChanged(auth, (user) => {
    if (user && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
        window.location.href = "dashboard.html";
    }
});