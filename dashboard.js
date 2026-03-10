import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, onSnapshot, where, doc, updateDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

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
let unsubscribeTasks = null; // Para limpar o monitor anterior ao trocar de projeto

// 1. Monitor de Sessão e Inicialização
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "index.html";
    } else {
        document.getElementById('user-name').innerText = user.displayName || user.email.split('@')[0];
        document.getElementById('user-photo').src = user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`;
        
        carregarProjetos(user.uid);
        selecionarProjeto("Geral"); // Começa sempre no Geral
    }
});

// 2. Carregar Lista de Projetos do Firebase
function carregarProjetos(uid) {
    const q = query(collection(db, "projects"), where("members", "array-contains", auth.currentUser.email));
    
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById('projects-list');
        list.innerHTML = `<li class="${currentProject === 'Geral' ? 'active' : ''}" onclick="selecionarProjeto('Geral')">Geral</li>`;
        
        snapshot.forEach((doc) => {
            const proj = doc.data();
            const li = document.createElement('li');
            li.innerText = proj.title;
            li.className = currentProject === proj.title ? 'active' : '';
            li.onclick = () => selecionarProjeto(proj.title);
            list.appendChild(li);
        });
    });
}

// 3. Selecionar Projeto e Trocar Tarefas
window.selecionarProjeto = (nome) => {
    currentProject = nome;
    
    // Atualiza visual da sidebar
    document.querySelectorAll('.projects-nav li').forEach(li => {
        li.classList.toggle('active', li.innerText === nome);
    });

    // Se já havia um monitor de tarefas, para ele antes de começar o novo
    if (unsubscribeTasks) unsubscribeTasks();
    
    carregarTarefas(auth.currentUser.uid, nome);
};

// 4. Carregar Tarefas do Projeto Selecionado
function carregarTarefas(uid, projeto) {
    const q = query(collection(db, "tasks"), 
                where("userId", "==", uid), 
                where("project", "==", projeto));
    
    unsubscribeTasks = onSnapshot(q, (snapshot) => {
        const cols = { todo: "", doing: "", done: "" };
        const counts = { todo: 0, doing: 0, done: 0 };

        snapshot.forEach(docSnap => {
            const t = docSnap.data();
            counts[t.status]++;
            cols[t.status] += `
                <div class="task-card" draggable="true" id="${docSnap.id}" ondragstart="drag(event)">
                    <h4>${t.title}</h4>
                    <p>${t.desc || ''}</p>
                </div>`;
        });

        ["todo", "doing", "done"].forEach(s => {
            document.getElementById(s).innerHTML = cols[s];
            document.getElementById(`count-${s}`).innerText = counts[s];
        });
    });
}

// 5. Salvar Nova Tarefa
document.getElementById('save-task').onclick = async () => {
    const title = document.getElementById('task-title').value.trim();
    const desc = document.getElementById('task-desc').value.trim();

    if (title && auth.currentUser) {
        await addDoc(collection(db, "tasks"), {
            userId: auth.currentUser.uid,
            project: currentProject,
            title: title,
            desc: desc,
            status: "todo",
            createdAt: serverTimestamp()
        });
        document.getElementById('task-modal').style.display = 'none';
        document.getElementById('task-title').value = "";
        document.getElementById('task-desc').value = "";
    }
};

// 6. Criar Novo Projeto no Firebase
document.getElementById('btn-new-project').onclick = async () => {
    const nome = prompt("Nome do novo projeto:");
    if (nome) {
        await addDoc(collection(db, "projects"), {
            title: nome,
            adminId: auth.currentUser.uid,
            members: [auth.currentUser.email], // Você é o primeiro membro
            createdAt: serverTimestamp()
        });
    }
};

// 7. Drag and Drop
window.drag = (ev) => ev.dataTransfer.setData("taskId", ev.target.id);
window.drop = async (ev) => {
    ev.preventDefault();
    const id = ev.dataTransfer.getData("taskId");
    const newStatus = ev.currentTarget.id;
    if (id && newStatus) {
        await updateDoc(doc(db, "tasks", id), { status: newStatus });
    }
};

// Outros Controles
document.getElementById('btn-add-task').onclick = () => document.getElementById('task-modal').style.display = 'flex';
document.getElementById('cancel-task').onclick = () => document.getElementById('task-modal').style.display = 'none';
document.getElementById('btn-logout').onclick = () => signOut(auth);