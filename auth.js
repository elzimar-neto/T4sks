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

// 1. Sua Configuração
const firebaseConfig = {
    apiKey: "AIzaSyCOHWpGPcdUEXuPopdZd16qQTDHKd-R994",
    authDomain: "t4sks-af64e.firebaseapp.com",
    projectId: "t4sks-af64e",
    storageBucket: "t4sks-af64e.firebasestorage.app",
    messagingSenderId: "1069050787483",
    appId: "1:1069050787483:web:04ac9c6780764ec14ef83e"
};

// 2. Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Elementos da Interface
const btnGoogle = document.getElementById('btn-google');
const btnContinue = document.querySelector('.btn-continue');
const emailInput = document.querySelector('input[type="text"]');

// --- LÓGICA 1: LOGIN COM GOOGLE ---
btnGoogle.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        await salvarUsuarioNoBanco(result.user);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Erro Google:", error);
        alert("Erro ao entrar com Google.");
    }
});

// --- LÓGICA 2: LOGIN COM E-MAIL E SENHA ---
// Habilitar o botão continuar se houver texto
emailInput.disabled = false;
emailInput.addEventListener('input', () => {
    const isValid = emailInput.value.length > 5 && emailInput.value.includes('@');
    btnContinue.disabled = !isValid;
    btnContinue.style.opacity = isValid ? "1" : "0.5";
    btnContinue.style.cursor = isValid ? "pointer" : "not-allowed";
});

btnContinue.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = prompt("Digite sua senha para o T4SKS:");

    if (!password) return;

    try {
        // Tenta fazer login
        const result = await signInWithEmailAndPassword(auth, email, password);
        await salvarUsuarioNoBanco(result.user);
        window.location.href = "dashboard.html";
    } catch (error) {
        // Se o usuário não existir, oferece para criar conta
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            const novoUsuario = confirm("Usuário não encontrado. Deseja criar uma nova conta com este e-mail?");
            if (novoUsuario) {
                try {
                    const result = await createUserWithEmailAndPassword(auth, email, password);
                    await salvarUsuarioNoBanco(result.user);
                    window.location.href = "dashboard.html";
                } catch (e) {
                    alert("Erro ao criar conta: " + e.message);
                }
            }
        } else {
            alert("Erro no login: " + error.message);
        }
    }
});

// --- FUNÇÃO AUXILIAR: SALVAR NO BANCO ---
async function salvarUsuarioNoBanco(user) {
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nome: user.displayName || emailInput.value.split('@')[0],
        email: user.email,
        foto: user.photoURL || "https://ui-avatars.com/api/?name=" + user.email,
        lastLogin: new Date()
    }, { merge: true });
}

// --- MONITOR DE SESSÃO ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        const isIndex = window.location.pathname.includes('index.html') || window.location.pathname === '/';
        if (isIndex) window.location.href = "dashboard.html";
    }
});