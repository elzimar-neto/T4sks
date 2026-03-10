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

// GESTÃO DE PROJETOS
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
    currentProject = nome;
    currentProjectId = id;
    document.getElementById('current-project-title').innerText = nome;
    document.getElementById('project-admin-tools').style.display = (id && adminId === auth.currentUser.uid) ? 'flex' : 'none';
    if (unsubscribeTasks) unsubscribeTasks();
    carregarTarefas(nome);
};

document.getElementById('btn-new-project').onclick = async () => {
    const n = prompt("Nome do Projeto:");
    if (n) await addDoc(collection(db, "projects"), { title: n, adminId: auth.currentUser.uid, members: [auth.currentUser.email], createdAt: serverTimestamp() });
};

document.getElementById('btn-delete-project').onclick = async () => {
    if (confirm("Excluir projeto e tarefas definitivamente?") && currentProjectId) {
        await deleteDoc(doc(db, "projects", currentProjectId));
        window.selecionarProjeto("Geral", null);
    }
};

document.getElementById('btn-edit-project').onclick = async () => {
    const novo = prompt("Renomear projeto:", currentProject);
    if (novo && currentProjectId) await updateDoc(doc(db, "projects", currentProjectId), { title: novo });
};

// GESTÃO DE TAREFAS
function carregarTarefas(projeto) {
    const q = query(collection(db, "tasks"), where("project", "==", projeto));
    unsubscribeTasks = onSnapshot(q, (snapshot) => {
        const cols = { todo: "", doing: "", done: "" };
        const counts = { todo: 0, doing: 0, done: 0 };
        snapshot.forEach(d => {
            const t = d.data(); counts[t.status]++;
            cols[t.status] += `<div class="task-card" draggable="true" id="${d.id}" ondragstart="drag(event)"><h4>${t.title}</h4><p>${t.desc || ''}</p></div>`;
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
        await addDoc(collection(db, "tasks"), { userId: auth.currentUser.uid, project: currentProject, title: t, desc: document.getElementById('task-desc').value, status: "todo", createdAt: serverTimestamp() });
        document.getElementById('task-modal').style.display = 'none';
        document.getElementById('task-title').value = "";
    }
};

// CONVITE COM BUSCA
document.getElementById('btn-invite').onclick = async () => {
    const email = prompt("E-mail do usuário cadastrado:");
    if (email) {
        const q = query(collection(db, "users"), where("email", "==", email));
        const snap = await getDocs(q);
        if (snap.empty) alert("Usuário não cadastrado no sistema.");
        else {
            const pSnap = await getDocs(query(collection(db, "projects"), where("title", "==", currentProject)));
            const members = pSnap.docs[0].data().members;
            if (!members.includes(email)) {
                members.push(email);
                await updateDoc(doc(db, "projects", currentProjectId), { members });
                alert("Membro adicionado!");
            }
        }
    }
};

// TEMA E UX
document.getElementById('toggle-theme').onclick = () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    const isLight = document.body.classList.contains('light-theme');
    document.getElementById('toggle-theme').innerHTML = isLight ? '<i class="fa-solid fa-sun"></i> Tema' : '<i class="fa-solid fa-moon"></i> Tema';
};

window.drag = (ev) => ev.dataTransfer.setData("taskId", ev.target.id);
window.drop = async (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("taskId");
    const status = ev.currentTarget.id;
    if (id && status) await updateDoc(doc(db, "tasks", id), { status });
};

document.getElementById('btn-archive-done').onclick = async () => {
    const q = query(collection(db, "tasks"), where("project", "==", currentProject), where("status", "==", "done"));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
};

document.getElementById('btn-add-task').onclick = () => document.getElementById('task-modal').style.display = 'flex';
document.getElementById('cancel-task').onclick = () => document.getElementById('task-modal').style.display = 'none';
document.getElementById('btn-logout').onclick = () => signOut(auth);
document.getElementById('search-input').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.task-card').forEach(c => c.style.display = c.innerText.toLowerCase().includes(term) ? "block" : "none");
};