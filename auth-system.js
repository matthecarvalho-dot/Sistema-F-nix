// auth-system.js
// Sistema de Autenticação com Firebase para Sistema Fênix

// ====================
// VERIFICAÇÃO DE LOGIN
// ====================

// Verificar automaticamente se usuário já está logado
auth.onAuthStateChanged((user) => {
    if (user) {
        // ✅ USUÁRIO LOGADO
        console.log("✅ Usuário autenticado:", user.email);
        console.log("ID do usuário:", user.uid);
        
        // Entrar no sistema
        entrarNoSistema(user);
        
        // Atualizar último acesso
        atualizarUltimoAcesso(user.uid);
    } else {
        // 🔒 USUÁRIO NÃO LOGADO
        console.log("🔒 Nenhum usuário logado");
        mostrarTelaLogin();
    }
});

// ====================
// FUNÇÕES PRINCIPAIS
// ====================

// Entrar no sistema
function entrarNoSistema(user) {
    // Esconder tela de login
    const loginScreen = document.getElementById('loginScreen');
    const mainSystem = document.getElementById('mainSystem');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (mainSystem) mainSystem.style.display = 'block';
    
    // Atualizar informações do usuário na interface
    atualizarInterfaceUsuario(user);
    
    // Carregar dados do usuário do banco
    carregarDadosUsuario(user.uid).then(dados => {
        if (dados) {
            console.log("Dados do usuário carregados:", dados);
            
            // Se for admin, mostrar menu especial
            if (dados.nivel === 'admin') {
                mostrarMenuAdmin();
            }
        }
    });
}

// Mostrar tela de login
function mostrarTelaLogin() {
    const loginScreen = document.getElementById('loginScreen');
    const mainSystem = document.getElementById('mainSystem');
    
    if (loginScreen) loginScreen.style.display = 'block';
    if (mainSystem) mainSystem.style.display = 'none';
    
    // Preencher campo de usuário se estiver lembrado
    const usuarioSalvo = localStorage.getItem('fenix_usuario');
    if (usuarioSalvo && document.getElementById('loginUsuario')) {
        document.getElementById('loginUsuario').value = usuarioSalvo;
        document.getElementById('lembrarUsuario').checked = true;
    }
}

// ====================
// LOGIN E CADASTRO
// ====================

// Função principal de login
async function fazerLogin() {
    const email = document.getElementById('loginUsuario').value.trim();
    const senha = document.getElementById('loginSenha').value;
    const lembrar = document.getElementById('lembrarUsuario')?.checked || false;
    
    // Validação básica
    if (!email || !senha) {
        mostrarMensagemAuth('Preencha todos os campos', 'error');
        return;
    }
    
    if (!validarEmail(email)) {
        mostrarMensagemAuth('Email inválido', 'error');
        return;
    }
    
    // Mostrar loading
    const btnLogin = document.querySelector('.btn-login');
    const btnOriginalText = btnLogin?.innerHTML;
    if (btnLogin) {
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ENTRANDO...';
        btnLogin.disabled = true;
    }
    
    try {
        // Tentar fazer login
        const userCredential = await auth.signInWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        console.log('✅ Login realizado com sucesso para:', user.email);
        
        // Salvar usuário se marcou "lembrar"
        if (lembrar) {
            localStorage.setItem('fenix_usuario', email);
        } else {
            localStorage.removeItem('fenix_usuario');
        }
        
        // Configurar persistência da sessão
        await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        
        mostrarMensagemAuth('Login realizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('❌ Erro no login:', error.code, error.message);
        
        // Tratamento de erros específicos
        switch (error.code) {
            case 'auth/user-not-found':
                // Usuário não existe - perguntar se quer criar conta
                if (confirm('Usuário não encontrado. Deseja criar uma nova conta com este email?')) {
                    await criarNovaConta(email, senha);
                } else {
                    mostrarMensagemAuth('Usuário não encontrado', 'error');
                }
                break;
                
            case 'auth/wrong-password':
                mostrarMensagemAuth('Senha incorreta', 'error');
                break;
                
            case 'auth/invalid-email':
                mostrarMensagemAuth('Email inválido', 'error');
                break;
                
            case 'auth/too-many-requests':
                mostrarMensagemAuth('Muitas tentativas. Tente novamente mais tarde.', 'error');
                break;
                
            case 'auth/user-disabled':
                mostrarMensagemAuth('Esta conta foi desativada', 'error');
                break;
                
            case 'auth/network-request-failed':
                mostrarMensagemAuth('Erro de conexão. Verifique sua internet.', 'error');
                break;
                
            default:
                mostrarMensagemAuth('Erro: ' + error.message, 'error');
        }
    } finally {
        // Restaurar botão
        if (btnLogin) {
            btnLogin.innerHTML = btnOriginalText || '<i class="fas fa-sign-in-alt"></i> ENTRAR NO SISTEMA';
            btnLogin.disabled = false;
        }
    }
}

// Criar nova conta
async function criarNovaConta(email, senha) {
    // Validar senha
    if (senha.length < 6) {
        mostrarMensagemAuth('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    try {
        // Criar usuário no Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        console.log('✅ Nova conta criada:', user.email);
        
        // Salvar dados do usuário no Firestore
        await db.collection('usuarios').doc(user.uid).set({
            email: email,
            nome: email.split('@')[0],
            dataCriacao: new Date(),
            nivel: 'usuario', // Padrão: usuario (pode ser admin, vendedor, etc.)
            clientesCount: 0,
            ultimoAcesso: new Date(),
            ativo: true,
            config: {
                tema: 'claro',
                notificacoes: true
            }
        });
        
        mostrarMensagemAuth('Conta criada com sucesso! Faça login.', 'success');
        
        // Limpar campos
        if (document.getElementById('loginSenha')) {
            document.getElementById('loginSenha').value = '';
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar conta:', error.code, error.message);
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                mostrarMensagemAuth('Este email já está em uso', 'error');
                break;
                
            case 'auth/weak-password':
                mostrarMensagemAuth('Senha muito fraca. Use pelo menos 6 caracteres.', 'error');
                break;
                
            case 'auth/operation-not-allowed':
                mostrarMensagemAuth('Criação de contas está desativada', 'error');
                break;
                
            default:
                mostrarMensagemAuth('Erro ao criar conta: ' + error.message, 'error');
        }
    }
}

// Fazer logout
async function fazerLogout() {
    try {
        // Confirmar logout
        if (!confirm('Deseja realmente sair do sistema?')) {
            return;
        }
        
        // Fazer logout no Firebase
        await auth.signOut();
        
        // Limpar dados locais
        localStorage.removeItem('fenix_usuario');
        
        console.log('✅ Logout realizado com sucesso');
        mostrarMensagemAuth('Você saiu do sistema', 'info');
        
        // Mostrar tela de login
        mostrarTelaLogin();
        
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        mostrarMensagemAuth('Erro ao sair do sistema', 'error');
    }
}

// ====================
// FUNÇÕES AUXILIARES
// ====================

// Atualizar interface com dados do usuário
function atualizarInterfaceUsuario(user) {
    if (!user) return;
    
    const nomeUsuario = user.email.split('@')[0];
    
    // Atualizar elementos que mostram o nome
    const elementosNome = [
        { id: 'userName', text: nomeUsuario },
        { id: 'userWelcome', text: `Bem-vindo, ${nomeUsuario}` },
        { id: 'currentUser', text: user.email }
    ];
    
    elementosNome.forEach(item => {
        const elemento = document.getElementById(item.id);
        if (elemento) {
            elemento.textContent = item.text;
        }
    });
    
    // Atualizar avatar/ícone
    const avatarElements = document.querySelectorAll('.user-avatar, .user-icon');
    avatarElements.forEach(el => {
        if (el.classList.contains('user-avatar')) {
            const iniciais = nomeUsuario.substring(0, 2).toUpperCase();
            el.textContent = iniciais;
        }
    });
}

// Carregar dados do usuário do Firestore
async function carregarDadosUsuario(userId) {
    try {
        const userDoc = await db.collection('usuarios').doc(userId).get();
        
        if (userDoc.exists) {
            const dados = userDoc.data();
            
            // Atualizar interface com dados extras
            if (dados.nome && dados.nome !== dados.email.split('@')[0]) {
                const elementoNome = document.getElementById('userName');
                if (elementoNome) elementoNome.textContent = dados.nome;
            }
            
            return dados;
        } else {
            // Se não existir no Firestore, criar documento básico
            await db.collection('usuarios').doc(userId).set({
                email: auth.currentUser.email,
                nome: auth.currentUser.email.split('@')[0],
                dataCriacao: new Date(),
                nivel: 'usuario',
                ultimoAcesso: new Date()
            });
            
            return {
                email: auth.currentUser.email,
                nome: auth.currentUser.email.split('@')[0],
                nivel: 'usuario'
            };
        }
    } catch (error) {
        console.error('❌ Erro ao carregar dados do usuário:', error);
        return null;
    }
}

// Atualizar último acesso
async function atualizarUltimoAcesso(userId) {
    try {
        await db.collection('usuarios').doc(userId).update({
            ultimoAcesso: new Date()
        });
    } catch (error) {
        console.error('❌ Erro ao atualizar último acesso:', error);
    }
}

// Mostrar menu admin (se for administrador)
function mostrarMenuAdmin() {
    const adminItems = document.querySelectorAll('.admin-only');
    adminItems.forEach(item => {
        item.style.display = 'block';
    });
    
    // Adicionar link para painel admin
    const menuLateral = document.querySelector('.sidebar ul');
    if (menuLateral && !document.getElementById('adminPanelItem')) {
        const adminLi = document.createElement('li');
        adminLi.id = 'adminPanelItem';
        adminLi.innerHTML = '<a href="#" onclick="abrirPainelAdmin()"><i class="fas fa-crown"></i> Painel Admin</a>';
        menuLateral.appendChild(adminLi);
    }
}

// ====================
// VALIDAÇÃO E UTILITÁRIOS
// ====================

// Validar formato de email
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mostrar mensagens de autenticação
function mostrarMensagemAuth(texto, tipo = 'info') {
    // Cores para tipos de mensagem
    const cores = {
        success: '#28a745', // Verde
        error: '#dc3545',   // Vermelho
        info: '#17a2b8',    // Azul
        warning: '#ffc107'  // Amarelo
    };
    
    // Criar elemento de mensagem
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = 'auth-message';
    mensagemDiv.textContent = texto;
    mensagemDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background-color: ${cores[tipo] || '#17a2b8'};
        color: white;
        border-radius: 8px;
        z-index: 99999;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInAuth 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Adicionar ao corpo
    document.body.appendChild(mensagemDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        mensagemDiv.style.animation = 'slideOutAuth 0.3s ease-in';
        setTimeout(() => {
            if (mensagemDiv.parentNode) {
                document.body.removeChild(mensagemDiv);
            }
        }, 300);
    }, 5000);
    
    // Adicionar estilos CSS se não existirem
    if (!document.querySelector('#auth-message-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-message-styles';
        style.textContent = `
            @keyframes slideInAuth {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutAuth {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .auth-message {
                font-family: Arial, sans-serif;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    }
}

// ====================
// FUNÇÕES GLOBAIS
// ====================

// Tornar funções disponíveis globalmente
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
window.criarNovaConta = criarNovaConta;

// Função para abrir painel admin (exemplo)
function abrirPainelAdmin() {
    mostrarMensagemAuth('Painel administrativo em desenvolvimento', 'info');
    // Aqui você pode redirecionar para uma página de admin ou mostrar modal
}

console.log("✅ Sistema de autenticação carregado com sucesso!");
