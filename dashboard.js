import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, where, doc, updateDoc, deleteDoc, serverTimestamp, writeBatch, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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
let allTasks = []; // Para busca local rápida

// 1. Verificação de Autenticação
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        document.getElementById('user-name').innerText = user.displayName || user.email.split('@')[0];
        document.getElementById('user-photo').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`;
        carregarTarefas(user.uid);
    }
});

// 2. Criar Tarefa
const modal = document.getElementById('task-modal');
document.getElementById('btn-add-task').onclick = () => modal.style.display = 'flex';
document.getElementById('cancel-task').onclick = () => modal.style.display = 'none';

document.getElementById('save-task').onclick = async () => {
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-desc').value;

    if (title) {
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
    }
};

// 3. Sistema de Busca
document.getElementById('search-input').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    renderizarTarefas(allTasks.filter(t => t.title.toLowerCase().includes(termo) || t.desc.toLowerCase().includes(termo)));
});

// 4. Carregar Tarefas (Real-time)
function carregarTarefas(uid) {
    const q = query(collection(db, "tasks"), where("userId", "==", uid), where("project", "==", currentProject));
    
    onSnapshot(q, (snapshot) => {
        allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderizarTarefas(allTasks);
    });
}

function renderizarTarefas(tasks) {
    const columns = { todo: "", doing: "", done: "" };
    const counts = { todo: 0, doing: 0, done: 0 };

    tasks.forEach(task => {
        counts[task.status]++;
        columns[task.status] += `
            <div class="task-card" draggable="true" id="${task.id}" ondragstart="drag(event)">
                <h4>${task.title}</h4>
                <p>${task.desc || ''}</p>
            </div>
        `;
    });

    Object.keys(columns).forEach(status => {
        document.getElementById(status).innerHTML = columns[status];
        document.getElementById(`count-${status}`).innerText = counts[status];
    });
}

// 5. Arrastar e Soltar (Globais)
window.drag = (ev) => ev.dataTransfer.setData("taskId", ev.target.id);
window.drop = async (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("taskId");
    const targetStatus = ev.currentTarget.id; // o id da div da lista (todo, doing, done)
    
    if (id && targetStatus) {
        await updateDoc(doc(db, "tasks", id), { status: targetStatus });
    }
};

// 6. Novo Projeto
document.getElementById('btn-new-project').onclick = () => {
    const nome = prompt("Nome do projeto:");
    if (nome) {
        const list = document.getElementById('projects-list');
        const li = document.createElement('li');
        li.innerText = nome;
        li.onclick = () => {
            document.querySelectorAll('.projects-nav li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            currentProject = nome;
            carregarTarefas(auth.currentUser.uid);
        };
        list.appendChild(li);
        li.click(); // Muda para o novo projeto automaticamente
    }
};

// 7. Arquivar Concluídas
document.getElementById('btn-archive-done').onclick = async () => {
    if(confirm("Deseja apagar permanentemente as tarefas concluídas?")) {
        const q = query(collection(db, "tasks"), where("userId", "==", auth.currentUser.uid), where("status", "==", "done"), where("project", "==", currentProject));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach(d => batch.delete(d.ref));
        await batch.commit();
    }
};

// 8. Logout e Outros
document.getElementById('btn-invite').onclick = () => alert("Link de convite copiado (Simulação)");
document.getElementById('btn-logout').onclick = () => signOut(auth);