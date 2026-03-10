/* --- SISTEMA DE CORES DINÂMICO (VARIÁVEIS) --- */
:root {
    /* Tema Escuro (Padrão) */
    --bg: #121212; 
    --card: #1e1e1e; 
    --accent: #1ed760; 
    --text: #ffffff; 
    --sidebar: #000000; 
    --border: #282828;
    --shadow: rgba(0,0,0,0.5);
}

.light-theme {
    /* Tema Claro */
    --bg: #f8f9fa; 
    --card: #ffffff; 
    --accent: #27ae60; 
    --text: #2c3e50; 
    --sidebar: #ffffff; 
    --border: #dee2e6;
    --shadow: rgba(0,0,0,0.1);
}

/* --- ESTILOS GERAIS --- */
* { box-sizing: border-box; }

body { 
    margin: 0; 
    font-family: 'Inter', 'Segoe UI', sans-serif; 
    background: var(--bg); 
    color: var(--text); 
    transition: background 0.3s, color 0.3s; 
}

.app-container { display: flex; height: 100vh; width: 100vw; }

/* --- SIDEBAR --- */
.sidebar { 
    width: 260px; 
    background: var(--sidebar); 
    display: flex; 
    flex-direction: column; 
    padding: 25px; 
    border-right: 1px solid var(--border); 
}

.logo-area { 
    font-size: 22px; 
    font-weight: 800; 
    color: var(--accent); 
    margin-bottom: 40px; 
    display: flex;
    align-items: center;
    gap: 10px;
}

.projects-nav h3 { 
    font-size: 11px; 
    display: flex; 
    justify-content: space-between; 
    color: var(--text); 
    opacity: 0.5; 
    margin-bottom: 15px;
    letter-spacing: 1px;
}

#btn-new-project { 
    background: var(--accent); 
    border: none; 
    color: #000; 
    border-radius: 50%; 
    cursor: pointer; 
    width: 20px; 
    height: 20px; 
    font-weight: bold; 
    display: flex;
    align-items: center;
    justify-content: center;
}

.projects-nav ul { list-style: none; padding: 0; margin-bottom: 20px; }

.projects-nav li { 
    padding: 12px; 
    border-radius: 8px; 
    cursor: pointer; 
    margin-bottom: 5px; 
    transition: 0.2s; 
    font-size: 14px;
}

.projects-nav li.active { 
    background: var(--accent); 
    color: #000; 
    font-weight: 600; 
}

.projects-nav li:hover:not(.active) {
    background: var(--border);
}

/* --- BOTÃO DE ALTERNAR TEMA --- */
.theme-switch { margin-top: auto; margin-bottom: 20px; }
#toggle-theme { 
    width: 100%; 
    background: var(--border); 
    color: var(--text); 
    border: 1px solid var(--border); 
    padding: 10px; 
    border-radius: 10px; 
    cursor: pointer; 
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    transition: 0.2s;
}
#toggle-theme:hover { opacity: 0.8; }

/* --- ÁREA PRINCIPAL (MAIN) --- */
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.top-bar { 
    padding: 20px 30px; 
    display: flex; 
    justify-content: space-between; 
    border-bottom: 1px solid var(--border); 
    align-items: center; 
}

.project-header { display: flex; align-items: center; gap: 15px; }

.btn-icon { 
    background: none; 
    border: none; 
    color: var(--text); 
    cursor: pointer; 
    font-size: 16px; 
    opacity: 0.6; 
    transition: 0.2s;
}
.btn-icon:hover { opacity: 1; color: var(--accent); }

.search-box { 
    background: var(--border); 
    padding: 10px 15px; 
    border-radius: 20px; 
    display: flex; 
    align-items: center; 
    width: 300px; 
}

.search-box input { 
    background: none; 
    border: none; 
    color: var(--text); 
    outline: none; 
    margin-left: 10px; 
    width: 100%; 
}

/* --- QUADRO KANBAN --- */
.kanban-board { 
    display: flex; 
    gap: 25px; 
    padding: 30px; 
    flex: 1; 
    overflow-x: auto; 
    background: var(--bg);
}

.kanban-column { 
    background: var(--card); 
    min-width: 320px; 
    max-width: 320px;
    border-radius: 15px; 
    padding: 20px; 
    display: flex; 
    flex-direction: column; 
    border: 1px solid var(--border); 
    box-shadow: 0 4px 15px var(--shadow);
    max-height: 100%;
}

.col-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 20px; 
}

.btn-plus { 
    background: var(--accent); 
    border: none; 
    color: #000; 
    border-radius: 50%; 
    width: 28px; 
    height: 28px; 
    cursor: pointer; 
    font-size: 18px; 
    font-weight: bold; 
    transition: transform 0.2s;
}
.btn-plus:hover { transform: scale(1.1); }

.task-list { flex: 1; min-height: 100px; overflow-y: auto; }

.task-card { 
    background: var(--bg); 
    padding: 18px; 
    border-radius: 10px; 
    border: 1px solid var(--border); 
    margin-bottom: 12px; 
    cursor: grab; 
    transition: 0.2s; 
}
.task-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.task-card h4 { margin: 0 0 8px 0; font-size: 14px; }
.task-card p { margin: 0; font-size: 12px; color: var(--text); opacity: 0.7; }

/* --- RODAPÉS --- */
.main-footer { 
    text-align: center; 
    padding: 15px; 
    font-size: 11px; 
    opacity: 0.5; 
    border-top: 1px solid var(--border); 
}

/* --- TELA DE LOGIN --- */
.auth-page { 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    height: 100vh; 
}

.login-card { 
    background: var(--card); 
    padding: 50px; 
    border-radius: 20px; 
    text-align: center; 
    width: 380px; 
    box-shadow: 0 10px 40px var(--shadow); 
    border: 1px solid var(--border); 
}

.logo { font-size: 60px; margin-bottom: 20px; }

.btn-social { 
    width: 100%; 
    padding: 14px; 
    border-radius: 25px; 
    border: 1px solid var(--border); 
    background: transparent; 
    color: var(--text); 
    font-weight: bold; 
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    gap: 10px; 
    transition: 0.2s;
}
.btn-social:hover { background: var(--border); }
.btn-social img { width: 20px; }

.auth-footer { margin-top: 30px; font-size: 11px; opacity: 0.6; line-height: 1.5; }

/* --- MODAL --- */
.modal { 
    display: none; 
    position: fixed; 
    top: 0; left: 0; 
    width: 100%; height: 100%; 
    background: rgba(0,0,0,0.8); 
    align-items: center; 
    justify-content: center; 
    z-index: 1000; 
}

.modal-content { 
    background: var(--card); 
    padding: 40px; 
    border-radius: 15px; 
    width: 450px; 
    border: 1px solid var(--border);
}

.btn-primary { 
    background: var(--accent); 
    color: #000; 
    border: none; 
    padding: 12px 25px; 
    border-radius: 25px; 
    cursor: pointer; 
    font-weight: bold; 
}
.btn-secondary {
    background: var(--border);
    color: var(--text);
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
}

/* --- PERFIL NO RODAPÉ DA SIDEBAR --- */
.user-footer { 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    padding-top: 20px; 
    border-top: 1px solid var(--border); 
}

#user-photo { width: 36px; height: 36px; border-radius: 50%; background: #333; }
#user-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
#btn-logout { background: none; border: none; color: var(--text); opacity: 0.5; cursor: pointer; margin-left: auto; }
#btn-logout:hover { opacity: 1; color: #ff4d4d; }

.btn-archive {
    margin-top: 15px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
    opacity: 0.6;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
}
.btn-archive:hover { opacity: 1; border-color: var(--accent); }