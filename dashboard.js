import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, where, doc, updateDoc, deleteDoc, serverTimestamp, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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

let currentProject = "Geral";
let allTasks = [];

// Proteção e Perfil
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        document.getElementById('user-name').innerText = user.displayName || user.email.split('@')[0];
        document.getElementById('user-photo').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`;
        carregarTarefas(user.uid);
    }
});

// MODAL E SALVAR TAREFA
const modal = document.getElementById('task-modal');
document.getElementById('btn-add-task').onclick = () => modal.style.display = 'flex';
document.getElementById('cancel-task').onclick = () => modal.style.display = 'none';

document.getElementById('save-task').addEventListener('click', async () => {
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();

    if (title && auth.currentUser) {
        try {
            await addDoc(collection(db, "tasks"), {
                userId: auth.currentUser.uid,
                project: currentProject,
                title: title,
                desc: desc,
                status: "todo",
                createdAt: serverTimestamp()
            });
            modal.style.display = 'none';
            document.getElementById('task-title').value = "";
            document.getElementById('task-desc').value = "";
        } catch (e) {
            console.error("Erro ao salvar:", e);
            alert("Erro ao salvar no banco de dados.");
        }
    } else {
        alert("Digite um título para a tarefa.");
    }
});

// RENDERIZAÇÃO E FILTRO
function carregarTarefas(uid) {
    const q = query(collection(db, "tasks"), where("userId", "==", uid), where("project", "==", currentProject));
    onSnapshot(q, (snapshot) => {
        allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizar(allTasks);
    });
}

function renderizar(tasks) {
    const cols = { todo: "", doing: "", done: "" };
    const counts = { todo: 0, doing: 0, done: 0 };

    tasks.forEach(t => {
        counts[t.status]++;
        cols[t.status] += `<div class="task-card" draggable="true" id="${t.id}" ondragstart="drag(event)">
            <h4>${t.title}</h4><p>${t.desc || ''}</p></div>`;
    });

    ["todo", "doing", "done"].forEach(s => {
        document.getElementById(s).innerHTML = cols[s];
        document.getElementById(`count-${s}`).innerText = counts[s];
    });
}

// DRAG AND DROP
window.drag = (ev) => ev.dataTransfer.setData("taskId", ev.target.id);
window.drop = async (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("taskId");
    const newStatus = ev.currentTarget.id;
    if (id && newStatus) await updateDoc(doc(db, "tasks", id), { status: newStatus });
};

// BUSCA
document.getElementById('search-input').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    renderizar(allTasks.filter(t => t.title.toLowerCase().includes(term)));
};

// NOVO PROJETO
document.getElementById('btn-new-project').onclick = () => {
    const name = prompt("Nome do Projeto:");
    if (name) {
        const li = document.createElement('li');
        li.innerText = name;
        li.onclick = () => {
            document.querySelectorAll('.projects-nav li').forEach(l => l.classList.remove('active'));
            li.classList.add('active');
            currentProject = name;
            carregarTarefas(auth.currentUser.uid);
        };
        document.getElementById('projects-list').appendChild(li);
        li.click();
    }
};

// LOGOUT
document.getElementById('btn-logout').onclick = () => signOut(auth);