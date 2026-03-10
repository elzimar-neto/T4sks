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
let currentProjectId = null;
let selectedPriority = 0;
let unsubscribeTasks = null;

onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "index.html";
    else {
        document.getElementById('user-name').innerText = user.displayName;
        document.getElementById('user-photo').src = user.photoURL;
        carregarProjetos();
        window.selecionarProjeto("Geral", null);
    }
});

// LOGICA ESTRELAS
document.querySelectorAll('#star-input i').forEach(star => {
    star.onclick = (e) => {
        selectedPriority = e.target.dataset.value;
        document.querySelectorAll('#star-input i').forEach(s => {
            s.classList.toggle('fa-solid', s.dataset.value <= selectedPriority);
            s.classList.toggle('fa-regular', s.dataset.value > selectedPriority);
        });
    };
});

function carregarProjetos() {
    const q = query(collection(db, "projects"), where("members", "array-contains", auth.currentUser.email));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('projects-list');
        list.innerHTML = `<li class="${currentProject === 'Geral' ? 'active' : ''}" onclick="selecionarProjeto('Geral', null)">Geral</li>`;
        snapshot.forEach((d) => {
            const p = d.data();
            const li = document.createElement('li');
            li.innerHTML = `<span>${p.title}</span>`;
            li.className = currentProjectId === d.id ? 'active' : '';
            li.onclick = () => window.selecionarProjeto(p.title, d.id, p.adminId);
            list.appendChild(li);
        });
    });
}

window.selecionarProjeto = (nome, id, adminId) => {
    currentProject = nome; currentProjectId = id;
    document.getElementById('current-project-title').innerText = nome;
    document.getElementById('project-admin-tools').style.display = (id && adminId === auth.currentUser.uid) ? 'flex' : 'none';
    if (unsubscribeTasks) unsubscribeTasks();
    carregarTarefas(nome);
};

function carregarTarefas(projeto) {
    const q = query(collection(db, "tasks"), where("project", "==", projeto));
    unsubscribeTasks = onSnapshot(q, (snapshot) => {
        const cols = { todo: "", doing: "", done: "" };
        const counts = { todo: 0, doing: 0, done: 0 };
        snapshot.forEach(d => {
            const t = d.data(); counts[t.status]++;
            let stars = "";
            for(let i=1; i<=5; i++) stars += `<i class="fa-star ${i <= t.priority ? 'fa-solid' : 'fa-regular'}"></i>`;
            
            cols[t.status] += `
                <div class="task-card" draggable="true" id="${d.id}" ondragstart="drag(event)">
                    <div class="card-priority">${stars}</div>
                    <h4>${t.title}</h4>
                    <p>${t.desc || ''}</p>
                    ${t.dueDate ? `<small class="date-tag"><i class="fa-regular fa-calendar"></i> ${t.dueDate}</small>` : ''}
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
            userId: auth.currentUser.uid,
            project: currentProject,
            title: t,
            desc: document.getElementById('task-desc').value,
            dueDate: document.getElementById('task-date').value,
            priority: selectedPriority,
            status: "todo",
            createdAt: serverTimestamp()
        });
        document.getElementById('task-modal').style.display = 'none';
        resetModal();
    }
};

function resetModal() {
    document.getElementById('task-title').value = "";
    document.getElementById('task-desc').value = "";
    document.getElementById('task-date').value = "";
    selectedPriority = 0;
    document.querySelectorAll('#star-input i').forEach(s => {
        s.classList.add('fa-regular'); s.classList.remove('fa-solid');
    });
}

// DRAG AND DROP - REFORÇADO
window.drag = (ev) => {
    ev.dataTransfer.setData("taskId", ev.target.id);
    ev.target.style.opacity = "0.5";
};

window.drop = async (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("taskId");
    const status = ev.currentTarget.id;
    const el = document.getElementById(id);
    if(el) el.style.opacity = "1";
    if (id && status) await updateDoc(doc(db, "tasks", id), { status });
};

// OUTROS EVENTOS
document.getElementById('toggle-theme').onclick = () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
};
document.getElementById('btn-add-task').onclick = () => document.getElementById('task-modal').style.display = 'flex';
document.getElementById('cancel-task').onclick = () => document.getElementById('task-modal').style.display = 'none';
document.getElementById('btn-logout').onclick = () => signOut(auth);
// (Restante da lógica de projeto/busca mantida)