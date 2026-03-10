import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, where } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

// Proteção da Rota
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        document.getElementById('user-name').innerText = user.displayName || "Usuário";
        document.getElementById('user-photo').src = user.photoURL || "https://ui-avatars.com/api/?name=User";
        carregarTarefas(user.uid);
    }
});

// Logout
document.getElementById('btn-logout').onclick = () => signOut(auth);

// Função para Carregar Tarefas em Tempo Real
function carregarTarefas(uid) {
    const q = query(collection(db, "tasks"), where("userId", "==", uid));
    
    onSnapshot(q, (snapshot) => {
        // Limpar listas
        document.getElementById('todo-list').innerHTML = "";
        document.getElementById('doing-list').innerHTML = "";
        document.getElementById('done-list').innerHTML = "";

        snapshot.forEach((doc) => {
            const task = doc.data();
            criarCardTarefa(doc.id, task);
        });
    });
}

function criarCardTarefa(id, task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `<h4>${task.title}</h4><p>${task.desc || ''}</p>`;
    
    document.getElementById(`${task.status}-list`).appendChild(card);
}

// Modal Toggle
const modal = document.getElementById('task-modal');
document.getElementById('btn-add-task').onclick = () => modal.style.display = 'flex';
document.getElementById('cancel-task').onclick = () => modal.style.display = 'none';

// Salvar Tarefa
document.getElementById('save-task').onclick = async () => {
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;

    if (title) {
        await addDoc(collection(db, "tasks"), {
            userId: auth.currentUser.uid,
            title: title,
            desc: desc,
            status: "todo",
            createdAt: new Date()
        });
        modal.style.display = 'none';
        document.getElementById('task-title').value = "";
    }
};