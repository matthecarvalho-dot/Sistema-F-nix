// ============================================
// SISTEMA DE CADASTRO DE USUÁRIOS
// ============================================

// Carregar usuários do localStorage ao iniciar
document.addEventListener('DOMContentLoaded', function() {
    // Carregar usuários salvos
    carregarUsuariosSalvos();
    
    // Resto do código existente...
    const usuarioSalvo = localStorage.getItem('fenix_usuario');
    if (usuarioSalvo) {
        document.getElementById('loginUsuario').value = usuarioSalvo;
        document.getElementById('lembrarUsuario').checked = true;
    }
    
    document.getElementById('loginSenha').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fazerLogin();
        }
    });
});

// Carregar usuários salvos do localStorage
function carregarUsuariosSalvos() {
    try {
        const usuariosSalvos = localStorage.getItem('fenix_usuarios');
        if (usuariosSalvos) {
            const usuarios = JSON.parse(usuariosSalvos);
            // Mesclar com usuários padrão (sem sobrescrever os existentes)
            for (const [usuario, dados] of Object.entries(usuarios)) {
                if (!USUARIOS[usuario]) {
                    USUARIOS[usuario] = dados;
                }
            }
            console.log('Usuários carregados:', Object.keys(USUARIOS).length);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

// Salvar usuários no localStorage
function salvarUsuarios() {
    try {
        localStorage.setItem('fenix_usuarios', JSON.stringify(USUARIOS));
        console.log('Usuários salvos:', Object.keys(USUARIOS).length);
        return true;
    } catch (error) {
        console.error('Erro ao salvar usuários:', error);
        return false;
    }
}

// Mostrar modal de cadastro
function mostrarCadastro() {
    // Limpar formulário primeiro
    limparFormularioCadastro();
    
    // Mostrar modal
    document.getElementById('cadastroModal').style.display = 'flex';
    
    // Focar no primeiro campo
    setTimeout(() => {
        document.getElementById('novoUsuario').focus();
    }, 100);
}

// Fechar modal de cadastro
function fecharCadastro() {
    document.getElementById('cadastroModal').style.display = 'none';
    limparFormularioCadastro();
}

// Limpar formulário de cadastro
function limparFormularioCadastro() {
    document.getElementById('novoUsuario').value = '';
    document.getElementById('novoEmail').value = '';
    document.getElementById('novoUsuarioLogin').value = '';
    document.getElementById('novaSenha').value = '';
    document.getElementById('confirmarSenha').value = '';
    document.getElementById('tipoUsuario').selectedIndex = 0;
    
    // Remover erros de validação
    const inputs = document.querySelectorAll('#cadastroModal input, #cadastroModal select');
    inputs.forEach(input => {
        input.style.borderColor = '';
        input.classList.remove('shake');
    });
}

// Criar nova conta
function criarNovaConta() {
    // Coletar dados do formulário
    const nomeCompleto = document.getElementById('novoUsuario').value.trim();
    const email = document.getElementById('novoEmail').value.trim();
    const usuario = document.getElementById('novoUsuarioLogin').value.trim().toLowerCase();
    const senha = document.getElementById('novaSenha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const tipo = document.getElementById('tipoUsuario').value;
    
    // Validar campos
    if (!validarFormularioCadastro()) {
        mostrarMensagemLogin('Preencha todos os campos corretamente!', 'error');
        return;
    }
    
    // Verificar se senhas coincidem
    if (senha !== confirmarSenha) {
        mostrarMensagemLogin('As senhas não coincidem!', 'error');
        document.getElementById('novaSenha').style.borderColor = '#F44336';
        document.getElementById('confirmarSenha').style.borderColor = '#F44336';
        document.getElementById('novaSenha').classList.add('shake');
        document.getElementById('confirmarSenha').classList.add('shake');
        setTimeout(() => {
            document.getElementById('novaSenha').classList.remove('shake');
            document.getElementById('confirmarSenha').classList.remove('shake');
        }, 500);
        return;
    }
    
    // Verificar se usuário já existe
    if (USUARIOS[usuario]) {
        mostrarMensagemLogin('Nome de usuário já está em uso!', 'error');
        document.getElementById('novoUsuarioLogin').style.borderColor = '#F44336';
        document.getElementById('novoUsuarioLogin').classList.add('shake');
        setTimeout(() => document.getElementById('novoUsuarioLogin').classList.remove('shake'), 500);
        return;
    }
    
    // Verificar se email é válido
    if (!validarEmail(email)) {
        mostrarMensagemLogin('Email inválido!', 'error');
        document.getElementById('novoEmail').style.borderColor = '#F44336';
        document.getElementById('novoEmail').classList.add('shake');
        setTimeout(() => document.getElementById('novoEmail').classList.remove('shake'), 500);
        return;
    }
    
    // Verificar força da senha
    if (senha.length < 6) {
        mostrarMensagemLogin('A senha deve ter no mínimo 6 caracteres!', 'error');
        document.getElementById('novaSenha').style.borderColor = '#F44336';
        document.getElementById('novaSenha').classList.add('shake');
        setTimeout(() => document.getElementById('novaSenha').classList.remove('shake'), 500);
        return;
    }
    
    // Criar novo usuário
    const novoUsuario = {
        senha: senha,
        nome: nomeCompleto,
        email: email,
        tipo: tipo,
        dataCadastro: new Date().toISOString(),
        ativo: true
    };
    
    // Adicionar aos usuários
    USUARIOS[usuario] = novoUsuario;
    
    // Salvar no localStorage
    const salvou = salvarUsuarios();
    
    if (salvou) {
        // Sucesso
        mostrarMensagemLogin('✅ Conta criada com sucesso! Faça login.', 'success');
        
        // Fechar modal
        fecharCadastro();
        
        // Preencher automaticamente o login
        document.getElementById('loginUsuario').value = usuario;
        document.getElementById('loginSenha').focus();
        
        // Mostrar mensagem de sucesso por 5 segundos
        setTimeout(() => {
            mostrarMensagemLogin('', 'success');
        }, 5000);
        
    } else {
        mostrarMensagemLogin('Erro ao criar conta. Tente novamente.', 'error');
    }
}

// Validar formulário de cadastro
function validarFormularioCadastro() {
    const campos = [
        { id: 'novoUsuario', nome: 'Nome completo' },
        { id: 'novoEmail', nome: 'Email' },
        { id: 'novoUsuarioLogin', nome: 'Nome de usuário' },
        { id: 'novaSenha', nome: 'Senha' },
        { id: 'confirmarSenha', nome: 'Confirmar senha' }
    ];
    
    let valido = true;
    
    for (const campo of campos) {
        const elemento = document.getElementById(campo.id);
        const valor = elemento.value.trim();
        
        if (!valor) {
            elemento.style.borderColor = '#F44336';
            elemento.classList.add('shake');
            setTimeout(() => elemento.classList.remove('shake'), 500);
            valido = false;
        } else {
            elemento.style.borderColor = '';
        }
    }
    
    return valido;
}

// Validar formato de email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Função para mostrar mensagem no login (modificada para suportar tipos)
function mostrarMensagemLogin(mensagem, tipo = 'info') {
    const errorElement = document.getElementById('loginError');
    errorElement.textContent = mensagem;
    errorElement.style.display = mensagem ? 'block' : 'none';
    
    switch(tipo) {
        case 'success':
            errorElement.style.color = '#4CAF50';
            break;
        case 'error':
            errorElement.style.color = '#F44336';
            errorElement.classList.add('shake');
            setTimeout(() => errorElement.classList.remove('shake'), 500);
            break;
        case 'warning':
            errorElement.style.color = '#FF9800';
            break;
        default:
            errorElement.style.color = '#2196F3';
    }
    
    // Se for sucesso, esconder após 5 segundos
    if (tipo === 'success') {
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// ============================================
// FUNÇÕES ADICIONAIS PARA GERENCIAMENTO DE USUÁRIOS
// ============================================

// Função para listar todos os usuários (apenas admin)
function listarUsuarios() {
    if (usuarioLogado && usuarioLogado.usuario === 'admin') {
        console.log('=== LISTA DE USUÁRIOS ===');
        for (const [usuario, dados] of Object.entries(USUARIOS)) {
            console.log(`Usuário: ${usuario}`);
            console.log(`  Nome: ${dados.nome}`);
            console.log(`  Email: ${dados.email || 'Não informado'}`);
            console.log(`  Tipo: ${dados.tipo || 'vendedor'}`);
            console.log(`  Data Cadastro: ${dados.dataCadastro ? new Date(dados.dataCadastro).toLocaleDateString('pt-BR') : 'Não informada'}`);
            console.log('---');
        }
    }
}

// Função para remover usuário (apenas admin)
function removerUsuario(usuarioParaRemover) {
    if (usuarioLogado && usuarioLogado.usuario === 'admin') {
        if (confirm(`Tem certeza que deseja remover o usuário "${usuarioParaRemover}"?`)) {
            if (USUARIOS[usuarioParaRemover]) {
                delete USUARIOS[usuarioParaRemover];
                salvarUsuarios();
                console.log(`Usuário "${usuarioParaRemover}" removido com sucesso.`);
                return true;
            }
        }
    }
    return false;
}

// Adicionar gerenciamento de usuários ao menu de configurações
function configurarSistema() {
    let mensagem = `⚙️ SISTEMA FÊNIX v${SYSTEM_CONFIG.versao}\n\n`;
    mensagem += `📊 Estatísticas:\n`;
    mensagem += `• Total de clientes: ${clientes.length}\n`;
    mensagem += `• Total de usuários: ${Object.keys(USUARIOS).length}\n`;
    mensagem += `• Usuário atual: ${usuarioLogado.nome} (${usuarioLogado.usuario})\n\n`;
    
    if (usuarioLogado.usuario === 'admin') {
        mensagem += `👥 Usuários do sistema:\n`;
        for (const [usuario, dados] of Object.entries(USUARIOS)) {
            mensagem += `• ${usuario} - ${dados.nome} (${dados.tipo || 'vendedor'})\n`;
        }
        mensagem += `\n`;
    }
    
    mensagem += `💡 Dica: Faça backup regular usando "Exportar Excel"!`;
    
    alert(mensagem);
}

// Adicionar botão para gerenciar usuários no menu (apenas para admin)
function mostrarGerenciamentoUsuarios() {
    if (usuarioLogado && usuarioLogado.usuario === 'admin') {
        // Criar modal para gerenciamento de usuários
        const modalContent = document.querySelector('#editModal .modal-content');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-users-cog"></i> GERENCIAR USUÁRIOS</h3>
                <button class="btn-close" onclick="fecharModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #FF6B00; color: white;">
                            <th style="padding: 10px; text-align: left;">Usuário</th>
                            <th style="padding: 10px; text-align: left;">Nome</th>
                            <th style="padding: 10px; text-align: left;">Tipo</th>
                            <th style="padding: 10px; text-align: left;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(USUARIOS).map(([usuario, dados]) => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${usuario}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${dados.nome}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${dados.tipo || 'vendedor'}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                                    ${usuario !== 'admin' ? `<button onclick="removerUsuarioModal('${usuario}')" style="background: #F44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Remover</button>` : '<small>Admin principal</small>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="modal-footer">
                <button onclick="fecharModal()" class="btn btn-secondary">Fechar</button>
                <button onclick="mostrarCadastro()" class="btn btn-primary">Novo Usuário</button>
            </div>
        `;
        
        document.getElementById('editModal').style.display = 'flex';
    } else {
        alert('Apenas administradores podem acessar esta funcionalidade.');
    }
}

// Função para remover usuário via modal
function removerUsuarioModal(usuario) {
    if (removerUsuario(usuario)) {
        mostrarGerenciamentoUsuarios(); // Recarregar a lista
    }
}
