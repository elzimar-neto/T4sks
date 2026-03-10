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

let currentProject = "Geral", currentProjectId = null, selectedPriority = 0, unsubscribeTasks = null;

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "index.html";
    else {
        document.getElementById('user-name').innerText = user.displayName;
        document.getElementById('user-photo').src = user.photoURL;
        carregarProjetos(); window.selecionarProjeto("Geral", null);
    }
});

// ESTRELAS
document.querySelectorAll('#star-input i').forEach(s => {
    s.onclick = (e) => {
        selectedPriority = e.target.dataset.v;
        document.querySelectorAll('#star-input i').forEach(st => {
            st.classList.toggle('fa-solid', st.dataset.v <= selectedPriority);
            st.classList.toggle('fa-regular', st.dataset.v > selectedPriority);
        });
    };
});

window.selecionarProjeto = (nome, id, adminId) => {
    currentProject = nome; currentProjectId = id;
    document.getElementById('current-project-title').innerText = nome;
    document.getElementById('project-admin-tools').style.display = (id && adminId === auth.currentUser.uid) ? 'flex' : 'none';
    if (unsubscribeTasks) unsubscribeTasks();
    carregarTarefas(nome);
};

function carregarTarefas(proj) {
    const q = query(collection(db, "tasks"), where("project", "==", proj));
    unsubscribeTasks = onSnapshot(q, (snap) => {
        const cols = { todo: "", doing: "", done: "" }, counts = { todo: 0, doing: 0, done: 0 };
        snap.forEach(d => {
            const t = d.data(); counts[t.status]++;
            let stars = ""; for(let i=1; i<=5; i++) stars += `<i class="fa-star ${i <= t.priority ? 'fa-solid' : 'fa-regular'}"></i>`;
            cols[t.status] += `<div class="task-card" draggable="true" id="${d.id}" ondragstart="drag(event)">
                <div class="card-stars">${stars}</div>
                <h4>${t.title}</h4>
                <p>${t.desc || ''}</p>
                ${t.dueDate ? `<small class="date-tag">📅 ${t.dueDate}</small>` : ''}
            </div>`;
        });
        ["todo", "doing", "done"].forEach(s => {
            document.getElementById(s).innerHTML = cols[s];
            document.getElementById(`count-${s}`).innerText = counts[s];
        });
    });
}

document.getElementById('save-task').onclick = async () => {
    const t = document.getElementById('task-title').value.trim();
    if (t) {
        await addDoc(collection(db, "tasks"), {
            userId: auth.currentUser.uid, project: currentProject, title: t,
            desc: document.getElementById('task-desc').value,
            dueDate: document.getElementById('task-date').value,
            priority: parseInt(selectedPriority),
            status: "todo", createdAt: serverTimestamp()
        });
        document.getElementById('task-modal').style.display = 'none';
        limparModal();
    }
};

function limparModal() {
    document.getElementById('task-title').value = ""; document.getElementById('task-desc').value = "";
    document.getElementById('task-date').value = ""; selectedPriority = 0;
    document.querySelectorAll('#star-input i').forEach(s => { s.classList.replace('fa-solid', 'fa-regular'); });
}

// DRAG & DROP RECONSTRUIDO
window.drag = (ev) => {
    ev.dataTransfer.setData("text/plain", ev.target.id);
    ev.target.classList.add('dragging');
};

window.drop = async (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("text/plain");
    const newStatus = ev.currentTarget.id;
    if (id && newStatus) await updateDoc(doc(db, "tasks", id), { status: newStatus });
};

// AUXILIARES
function carregarProjetos() {
    onSnapshot(query(collection(db, "projects"), where("members", "array-contains", auth.currentUser.email)), (snap) => {
        const list = document.getElementById('projects-list');
        list.innerHTML = `<li class="${currentProject === 'Geral' ? 'active' : ''}" onclick="selecionarProjeto('Geral', null)">Geral</li>`;
        snap.forEach(d => {
            const p = d.data();
            const li = document.createElement('li');
            li.innerText = p.title; li.className = currentProjectId === d.id ? 'active' : '';
            li.onclick = () => window.selecionarProjeto(p.title, d.id, p.adminId);
            list.appendChild(li);
        });
    });
}

document.getElementById('toggle-theme').onclick = () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
};
document.getElementById('btn-add-task').onclick = () => document.getElementById('task-modal').style.display = 'flex';
document.getElementById('cancel-task').onclick = () => document.getElementById('task-modal').style.display = 'none';
document.getElementById('btn-logout').onclick = () => signOut(auth);