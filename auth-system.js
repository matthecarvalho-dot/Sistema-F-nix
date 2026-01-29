// auth-system.js - VERSÃO SIMPLIFICADA PARA TESTE

console.log("🔐 Sistema de autenticação carregado");

// Função de login simplificada
async function fazerLogin() {
    console.log("🔄 Tentando fazer login...");
    
    const email = document.getElementById('loginUsuario').value;
    const senha = document.getElementById('loginSenha').value;
    
    if (!email || !senha) {
        alert('Por favor, preencha email e senha');
        return;
    }
    
    console.log('Email:', email);
    console.log('Auth disponível?', typeof auth !== 'undefined');
    
    try {
        // Tentar fazer login
        const userCredential = await auth.signInWithEmailAndPassword(email, senha);
        alert('✅ Login realizado com sucesso!');
        console.log('Usuário logado:', userCredential.user.email);
        
        // Mostrar sistema principal
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        document.getElementById('userName').textContent = userCredential.user.email.split('@')[0];
        
    } catch (error) {
        console.error('❌ Erro no login:', error.code, error.message);
        
        // Se usuário não existe, criar conta
        if (error.code === 'auth/user-not-found') {
            if (confirm('Usuário não encontrado. Deseja criar uma nova conta?')) {
                try {
                    const newUser = await auth.createUserWithEmailAndPassword(email, senha);
                    alert('🎉 Conta criada com sucesso! Faça login novamente.');
                    console.log('Nova conta criada:', newUser.user.email);
                } catch (createError) {
                    alert('Erro ao criar conta: ' + createError.message);
                }
            }
        } else {
            alert('Erro: ' + error.message);
        }
    }
}

// Função de logout
function fazerLogout() {
    auth.signOut().then(() => {
        alert('Você saiu do sistema');
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('mainSystem').style.display = 'none';
    });
}

// Verificar se já está logado
if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('👤 Usuário já logado:', user.email);
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('mainSystem').style.display = 'block';
            document.getElementById('userName').textContent = user.email.split('@')[0];
        } else {
            console.log('🔒 Nenhum usuário logado');
        }
    });
}

// Exportar funções
window.fazerLogin = fazerLogin;
window.fazerLogout = fazerLogout;
