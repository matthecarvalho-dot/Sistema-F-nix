// ============================================
// CONFIGURAÇÕES DO SISTEMA
// ============================================
const SYSTEM_CONFIG = {
    nome: 'Fênix Client Management',
    versao: '2.0',
    dataFile: 'clientes_fenix.json'
};
// ============================================
// SISTEMA DE LOGOMARCA
// ============================================

// Verificar e carregar logos
function verificarLogos() {
    // Verificar logo do login
    const loginLogo = document.querySelector('.system-logo');
    const loginIcon = document.querySelector('.login-logo .phoenix-icon');
    
    if (loginLogo) {
        loginLogo.onload = function() {
            this.classList.add('loaded');
            if (loginIcon) loginIcon.style.display = 'none';
        };
        
        loginLogo.onerror = function() {
            console.log('Logo principal não carregada');
            if (loginIcon) loginIcon.style.display = 'flex';
            // Tentar carregar fallback
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="%23FF6B00"/><path d="M60,30 L75,75 L60,90 L45,75 Z" fill="white"/><circle cx="60" cy="60" r="30" fill="none" stroke="white" stroke-width="3"/></svg>';
        };
    }
    
    // Verificar logo do header
    const headerLogo = document.querySelector('.header-logo');
    const headerIcon = document.querySelector('.logo-container .phoenix-icon');
    
    if (headerLogo) {
        headerLogo.onload = function() {
            this.classList.add('loaded');
            if (headerIcon) headerIcon.style.display = 'none';
        };
        
        headerLogo.onerror = function() {
            console.log('Logo do header não carregada');
            if (headerIcon) headerIcon.style.display = 'flex';
            // Tentar carregar fallback
            this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="%23FF6B00"/><path d="M25,15 L32,30 L25,35 L18,30 Z" fill="white"/><circle cx="25" cy="25" r="12" fill="none" stroke="white" stroke-width="2"/></svg>';
        };
    }
}

// Criar logo SVG alternativa
function criarLogoSVG() {
    // SVG para login (grande)
    const svgLogin = `
        <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="fenixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FF6B00"/>
                    <stop offset="100%" stop-color="#FF852E"/>
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <circle cx="60" cy="60" r="50" fill="url(#fenixGradient)" filter="url(#glow)"/>
            <path d="M60,30 L75,65 L60,80 L45,65 Z" fill="white" stroke="#FF6B00" stroke-width="2"/>
            <circle cx="60" cy="60" r="25" fill="none" stroke="white" stroke-width="3"/>
            <path d="M60,40 C50,40 40,50 40,60 C40,70 50,80 60,80 C70,80 80,70 80,60 C80,50 70,40 60,40 Z" 
                  fill="none" stroke="white" stroke-width="2"/>
        </svg>
    `;
    
    // SVG para header (pequeno)
    const svgHeader = `
        <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="20" fill="#FF6B00"/>
            <path d="M25,15 L32,28 L25,33 L18,28 Z" fill="white"/>
            <circle cx="25" cy="25" r="10" fill="none" stroke="white" stroke-width="2"/>
        </svg>
    `;
    
    return { svgLogin, svgHeader };
}

// Inserir logos SVG se as imagens não carregarem
function inserirLogosSVGFallback() {
    // Verificar após 2 segundos se as logos carregaram
    setTimeout(() => {
        const loginLogo = document.querySelector('.system-logo');
        const headerLogo = document.querySelector('.header-logo');
        
        // Se login logo não carregou, inserir SVG
        if (loginLogo && (loginLogo.naturalWidth === 0 || loginLogo.complete === false)) {
            const svgContainer = document.querySelector('.logo-image-container');
            if (svgContainer) {
                const { svgLogin } = criarLogoSVG();
                svgContainer.innerHTML = svgLogin;
                document.querySelector('.login-logo .phoenix-icon').style.display = 'none';
            }
        }
        
        // Se header logo não carregou, inserir SVG
        if (headerLogo && (headerLogo.naturalWidth === 0 || headerLogo.complete === false)) {
            const svgHeaderContainer = document.querySelector('.logo-image-header');
            if (svgHeaderContainer) {
                const { svgHeader } = criarLogoSVG();
                svgHeaderContainer.innerHTML = svgHeader;
                document.querySelector('.logo-container .phoenix-icon').style.display = 'none';
            }
        }
    }, 2000);
}

// Atualizar a função inicializarSistemaPrincipal
function inicializarSistemaPrincipal() {
    // Atualizar informações do usuário
    if (usuarioLogado) {
        document.getElementById('userName').textContent = usuarioLogado.nome;
        document.getElementById('userWelcome').textContent = `Bem-vindo(a), ${usuarioLogado.nome}`;
    }
    
    // Verificar e carregar logos
    verificarLogos();
    inserirLogosSVGFallback();
    
    // Inicializar formatação
    inicializarFormatacao();
    
    // Carregar data atual
    document.getElementById('data').value = new Date().toISOString().split('T')[0];
    atualizarDataAtual();
    
    // Carregar dados salvos
    carregarDados();
    
    // Esconder loading
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.container').style.display = 'grid';
        mostrarMensagem('Sistema Fênix carregado com sucesso!', 'success');
    }, 1000);
}
// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let clientes = [];
let clienteEditando = null;
let currentSection = 'form';
let usuarioLogado = null;

// ============================================
// SISTEMA DE LOGIN
// ============================================

// Usuários do sistema
const USUARIOS = {
    'admin': { senha: 'admin123', nome: 'Administrador' },
    'patricia': { senha: 'patricia123', nome: 'Patricia' },
    'julya': { senha: 'julya123', nome: 'Julya' },
    'nataly': { senha: 'nataly123', nome: 'Nataly' },
    'evelyn': { senha: 'evelyn123', nome: 'Evelyn' },
    'isabelle': { senha: 'isabelle123', nome: 'Isabelle' }
};

// Inicializar sistema
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se tem usuário lembrado
    const usuarioSalvo = localStorage.getItem('fenix_usuario');
    if (usuarioSalvo) {
        document.getElementById('loginUsuario').value = usuarioSalvo;
        document.getElementById('lembrarUsuario').checked = true;
    }
    
    // Configurar evento de enter no login
    document.getElementById('loginSenha').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fazerLogin();
        }
    });
});

// Função para fazer login
function fazerLogin() {
    const usuario = document.getElementById('loginUsuario').value.trim();
    const senha = document.getElementById('loginSenha').value;
    const lembrar = document.getElementById('lembrarUsuario').checked;
    
    // Validar campos
    if (!usuario || !senha) {
        mostrarErroLogin('Preencha usuário e senha');
        return;
    }
    
    // Verificar credenciais
    if (USUARIOS[usuario] && USUARIOS[usuario].senha === senha) {
        // Login bem sucedido
        usuarioLogado = {
            usuario: usuario,
            nome: USUARIOS[usuario].nome
        };
        
        // Salvar usuário se marcado para lembrar
        if (lembrar) {
            localStorage.setItem('fenix_usuario', usuario);
        } else {
            localStorage.removeItem('fenix_usuario');
        }
        
        // Mostrar sistema principal
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        
        // Inicializar sistema principal
        inicializarSistemaPrincipal();
        
    } else {
        mostrarErroLogin('Usuário ou senha incorretos');
    }
}

// Função para fazer logout
function fazerLogout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        // Salvar dados antes de sair
        salvarDados();
        
        // Voltar para tela de login
        document.getElementById('mainSystem').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        
        // Limpar senha
        document.getElementById('loginSenha').value = '';
        
        mostrarMensagemLogin('Logout realizado com sucesso');
    }
}

function mostrarErroLogin(mensagem) {
    const errorElement = document.getElementById('loginError');
    errorElement.textContent = mensagem;
    errorElement.style.display = 'block';
    errorElement.style.color = '#F44336';
    errorElement.classList.add('shake');
    setTimeout(() => errorElement.classList.remove('shake'), 500);
}

function mostrarMensagemLogin(mensagem) {
    const errorElement = document.getElementById('loginError');
    errorElement.textContent = mensagem;
    errorElement.style.display = 'block';
    errorElement.style.color = '#4CAF50';
    setTimeout(() => errorElement.style.display = 'none', 3000);
}

// ============================================
// SISTEMA PRINCIPAL
// ============================================

function inicializarSistemaPrincipal() {
    // Atualizar informações do usuário
    if (usuarioLogado) {
        document.getElementById('userName').textContent = usuarioLogado.nome;
        document.getElementById('userWelcome').textContent = `Bem-vindo(a), ${usuarioLogado.nome}`;
    }
    
    // Inicializar formatação
    inicializarFormatacao();
    
    // Carregar data atual
    document.getElementById('data').value = new Date().toISOString().split('T')[0];
    atualizarDataAtual();
    
    // Carregar dados salvos
    carregarDados();
    
    // Esconder loading
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        document.querySelector('.container').style.display = 'grid';
        mostrarMensagem('Sistema Fênix carregado com sucesso!', 'success');
    }, 1000);
}

function atualizarDataAtual() {
    const now = new Date();
    document.getElementById('dataAtual').textContent = 
        now.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
}

// ============================================
// FORMATAÇÃO DOS CAMPOS
// ============================================

function inicializarFormatacao() {
    // Formatar CNPJ
    document.getElementById('cnpj').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 14) {
            if (value.length <= 2) {
                value = value;
            } else if (value.length <= 5) {
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            } else if (value.length <= 8) {
                value = value.replace(/^(\d{2})(\d{3})(\d)/, '$1.$2.$3');
            } else if (value.length <= 12) {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4');
            } else {
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5');
            }
        }
        
        e.target.value = value;
    });
    
    // Formatar Telefone
    document.getElementById('telefone').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) value = value.substring(0, 11);
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        
        e.target.value = value;
    });
    
    // Formatar Valor Total
    document.getElementById('valorTotal').addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^\d,]/g, '');
        value = value.replace(',', '');
        
        if (value === '') {
            e.target.value = '';
            document.getElementById('valorParcela').value = '';
            return;
        }
        
        let valorNumerico = parseInt(value) / 100;
        e.target.value = valorNumerico.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        calcularParcelas();
    });
    
    // Formatar Valor Parcela
    document.getElementById('valorParcela').addEventListener('input', function(e) {
        formatarValorParcela(e.target);
    });
    
    // Configurar eventos dos uploads
    document.getElementById('contratoInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('contratoStatus').textContent = file.name;
            document.getElementById('contratoStatus').style.color = '#4CAF50';
        }
    });
    
    document.getElementById('logomarcaInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('logomarcaStatus').textContent = file.name;
            document.getElementById('logomarcaStatus').style.color = '#4CAF50';
            document.getElementById('possuiLogomarca').checked = true;
        }
    });
}

function formatarValorParcela(input) {
    let value = input.value.replace(/[^\d,]/g, '');
    value = value.replace(',', '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    let valorNumerico = parseInt(value) / 100;
    input.value = valorNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function calcularParcelas() {
    const valorTotalInput = document.getElementById('valorTotal').value;
    const valorLimpo = parseFloat(valorTotalInput.replace(/\./g, '').replace(',', '.'));
    
    if (!isNaN(valorLimpo) && valorLimpo > 0) {
        const parcela = (valorLimpo / 12).toFixed(2);
        
        // Só preenche automaticamente se o campo estiver vazio
        const parcelaAtual = document.getElementById('valorParcela').value;
        if (!parcelaAtual || parcelaAtual === '0,00' || parcelaAtual === '0.00') {
            document.getElementById('valorParcela').value = parseFloat(parcela).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
    }
}

// ============================================
// SISTEMA DE SALVAMENTO
// ============================================

function salvarDados() {
    try {
        const dadosParaSalvar = {
            sistema: SYSTEM_CONFIG.nome,
            versao: SYSTEM_CONFIG.versao,
            dataAtualizacao: new Date().toISOString(),
            totalClientes: clientes.length,
            usuario: usuarioLogado ? usuarioLogado.usuario : 'desconhecido',
            clientes: clientes
        };
        
        // Salvar no localStorage
        localStorage.setItem('fenix_clientes', JSON.stringify(dadosParaSalvar));
        
        // Atualizar informações
        document.getElementById('dataInfo').textContent = `${clientes.length} clientes`;
        document.getElementById('systemInfo').textContent = `Última atualização: ${formatarData(new Date())}`;
        
        return true;
    } catch (error) {
        console.error('Erro ao salvar dados:', error);
        return false;
    }
}

function carregarDados() {
    try {
        const dadosSalvos = localStorage.getItem('fenix_clientes');
        
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            clientes = dados.clientes || [];
            console.log('Dados carregados:', clientes.length, 'clientes');
        } else {
            clientes = [];
            console.log('Nenhum dado salvo encontrado');
        }
        
        atualizarContador();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        clientes = [];
        atualizarContador();
    }
}

// ============================================
// FUNÇÕES DO FORMULÁRIO
// ============================================

async function salvarCliente() {
    if (!validarFormulario()) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Verificar se parcela foi preenchida, senão calcular
    let valorParcela = document.getElementById('valorParcela').value;
    if (!valorParcela || valorParcela === '0,00') {
        const valorTotalInput = document.getElementById('valorTotal').value;
        const valorLimpo = parseFloat(valorTotalInput.replace(/\./g, '').replace(',', '.'));
        if (!isNaN(valorLimpo) && valorLimpo > 0) {
            const parcelaCalculada = (valorLimpo / 12).toFixed(2);
            valorParcela = parseFloat(parcelaCalculada).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            document.getElementById('valorParcela').value = valorParcela;
        }
    }
    
    // Coletar dados do formulário
    const cliente = {
        id: Date.now(),
        cnpj: document.getElementById('cnpj').value,
        data: document.getElementById('data').value,
        marca: document.getElementById('marca').value,
        cliente: document.getElementById('cliente').value,
        telefone: document.getElementById('telefone').value,
        valorTotal: document.getElementById('valorTotal').value,
        valorParcela: valorParcela,
        vendedora: document.getElementById('vendedora').value,
        possuiLogomarca: document.getElementById('possuiLogomarca').checked,
        contratoArquivo: document.getElementById('contratoStatus').textContent,
        logomarcaArquivo: document.getElementById('logomarcaStatus').textContent,
        dataCadastro: new Date().toISOString(),
        cadastradoPor: usuarioLogado ? usuarioLogado.nome : 'Sistema',
        status: 'Ativo'
    };
    
    // Adicionar à lista
    clientes.push(cliente);
    
    // Criar pasta virtual
    criarPastaCliente(cliente);
    
    // SALVAR DADOS
    const salvou = salvarDados();
    
    if (salvou) {
        mostrarMensagem('Cliente cadastrado com sucesso! Dados salvos.', 'success');
        limparFormulario();
        atualizarContador();
        
        // Se estiver na tela de busca, atualizar tabela
        if (currentSection === 'search') {
            carregarTodosClientes();
        }
        
        // Atualizar dashboard se estiver visível
        if (currentSection === 'dashboard') {
            atualizarDashboard();
        }
    } else {
        mostrarMensagem('Erro ao salvar dados. Tente novamente.', 'error');
    }
}

function validarFormulario() {
    const camposObrigatorios = ['cnpj', 'marca', 'cliente', 'telefone', 'valorTotal', 'vendedora'];
    
    for (let campoId of camposObrigatorios) {
        const campo = document.getElementById(campoId);
        if (!campo.value.trim()) {
            campo.style.borderColor = '#F44336';
            campo.classList.add('shake');
            setTimeout(() => campo.classList.remove('shake'), 500);
            return false;
        } else {
            campo.style.borderColor = '';
        }
    }
    
    // Validar CNPJ
    const cnpj = document.getElementById('cnpj').value;
    const cnpjNumeros = cnpj.replace(/\D/g, '');
    if (cnpjNumeros.length !== 14) {
        mostrarMensagem('CNPJ inválido! Deve ter 14 dígitos.', 'error');
        return false;
    }
    
    return true;
}

function criarPastaCliente(cliente) {
    const nomePasta = `${cliente.marca.replace(/\s+/g, '_')}_${cliente.cnpj.replace(/\D/g, '')}`;
    document.getElementById('pastaStatus').textContent = `Criada: ${nomePasta}`;
    document.getElementById('pastaStatus').style.color = '#4CAF50';
}

// ============================================
// NAVEGAÇÃO
// ============================================

function mostrarBusca() {
    mudarSecao('search');
    carregarTodosClientes();
}

function mostrarFormulario() {
    mudarSecao('form');
}

function mostrarDashboard() {
    mudarSecao('dashboard');
    atualizarDashboard();
}

function mudarSecao(secao) {
    // Esconder todas as seções
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('section-hidden');
    });
    
    // Mostrar seção atual
    document.getElementById(secao + 'Section').classList.remove('section-hidden');
    document.getElementById(secao + 'Section').classList.add('active-section');
    
    // Atualizar menu ativo
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    
    // Encontrar e ativar item correto
    const menuItems = document.querySelectorAll('.sidebar li');
    let itemIndex = 0;
    
    switch(secao) {
        case 'form': itemIndex = 0; break;
        case 'search': itemIndex = 1; break;
        case 'dashboard': itemIndex = 2; break;
        default: itemIndex = 0;
    }
    
    if (menuItems[itemIndex]) {
        menuItems[itemIndex].classList.add('active');
    }
    
    currentSection = secao;
}

// ============================================
// BUSCA DE CLIENTES
// ============================================

function carregarTodosClientes() {
    const tbody = document.getElementById('clientesTableBody');
    tbody.innerHTML = '';
    
    if (clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: #666; margin-bottom: 20px; display: block;"></i>
                    <h3 style="color: #999;">Nenhum cliente cadastrado</h3>
                    <p>Cadastre seu primeiro cliente usando o formulário principal.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.cnpj}</td>
            <td><strong>${cliente.marca}</strong></td>
            <td>${cliente.cliente}</td>
            <td>${cliente.telefone}</td>
            <td><span class="valor-total">R$ ${cliente.valorTotal}</span></td>
            <td><span class="vendedora-tag">${cliente.vendedora}</span></td>
            <td><span class="status-badge status-${cliente.status.toLowerCase()}">${cliente.status}</span></td>
            <td>
                <div class="action-buttons-table">
                    <button class="btn-table btn-view" onclick="visualizarCliente(${cliente.id})" title="Visualizar">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-table btn-edit" onclick="editarCliente(${cliente.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-table btn-delete" onclick="deletarCliente(${cliente.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function buscarClientes() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const vendedoraFiltro = document.getElementById('filterVendedora').value;
    const statusFiltro = document.getElementById('filterStatus').value;
    
    if (!termo && !vendedoraFiltro && !statusFiltro) {
        carregarTodosClientes();
        return;
    }
    
    const resultados = clientes.filter(cliente => {
        // Filtro por termo de busca
        const matchTermo = !termo || 
            cliente.cnpj.toLowerCase().includes(termo) ||
            cliente.marca.toLowerCase().includes(termo) ||
            cliente.cliente.toLowerCase().includes(termo) ||
            cliente.telefone.toLowerCase().includes(termo) ||
            cliente.vendedora.toLowerCase().includes(termo);
        
        // Filtro por vendedora
        const matchVendedora = !vendedoraFiltro || cliente.vendedora === vendedoraFiltro;
        
        // Filtro por status
        const matchStatus = !statusFiltro || cliente.status === statusFiltro;
        
        return matchTermo && matchVendedora && matchStatus;
    });
    
    // Mostrar resultados
    const tbody = document.getElementById('clientesTableBody');
    tbody.innerHTML = '';
    
    if (resultados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; display: block;"></i>
                    Nenhum cliente encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    resultados.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente.cnpj}</td>
            <td><strong>${cliente.marca}</strong></td>
            <td>${cliente.cliente}</td>
            <td>${cliente.telefone}</td>
            <td><span class="valor-total">R$ ${cliente.valorTotal}</span></td>
            <td><span class="vendedora-tag">${cliente.vendedora}</span></td>
            <td><span class="status-badge status-${cliente.status.toLowerCase()}">${cliente.status}</span></td>
            <td>
                <div class="action-buttons-table">
                    <button class="btn-table btn-view" onclick="visualizarCliente(${cliente.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-table btn-edit" onclick="editarCliente(${cliente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-table btn-delete" onclick="deletarCliente(${cliente.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarPorVendedora() {
    buscarClientes();
}

function filtrarPorStatus() {
    buscarClientes();
}

// ============================================
// DASHBOARD
// ============================================

function atualizarDashboard() {
    if (currentSection !== 'dashboard') return;
    
    // Atualizar cards
    document.getElementById('totalClientes').textContent = clientes.length;
    
    // Calcular faturamento total
    let faturamentoTotal = 0;
    clientes.forEach(cliente => {
        const valor = parseFloat(cliente.valorTotal.replace(/\./g, '').replace(',', '.'));
        if (!isNaN(valor)) {
            faturamentoTotal += valor;
        }
    });
    document.getElementById('totalFaturamento').textContent = 
        `R$ ${faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Contar clientes ativos
    const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
    document.getElementById('clientesAtivos').textContent = clientesAtivos;
    
    // Contar clientes pendentes
    const clientesPendentes = clientes.filter(c => c.status === 'Pendente').length;
    document.getElementById('clientesPendentes').textContent = clientesPendentes;
}

// ============================================
// EDIÇÃO E EXCLUSÃO
// ============================================

function editarCliente(id) {
    clienteEditando = clientes.find(c => c.id === id);
    
    if (!clienteEditando) return;
    
    const modalContent = document.querySelector('#editModal .modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-edit"></i> EDITAR CLIENTE</h3>
            <button class="btn-close" onclick="fecharModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-grid">
                <div class="form-column">
                    <div class="form-group">
                        <label for="editCnpj"><i class="fas fa-id-card"></i> CNPJ *</label>
                        <input type="text" id="editCnpj" value="${clienteEditando.cnpj}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editMarca"><i class="fas fa-tag"></i> MARCA *</label>
                        <input type="text" id="editMarca" value="${clienteEditando.marca}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editCliente"><i class="fas fa-user-tie"></i> CLIENTE *</label>
                        <input type="text" id="editCliente" value="${clienteEditando.cliente}">
                    </div>
                </div>
                
                <div class="form-column">
                    <div class="form-group">
                        <label for="editTelefone"><i class="fas fa-phone"></i> TELEFONE *</label>
                        <input type="text" id="editTelefone" value="${clienteEditando.telefone}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editValorTotal"><i class="fas fa-money-bill-wave"></i> VALOR TOTAL *</label>
                        <input type="text" id="editValorTotal" value="${clienteEditando.valorTotal}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editVendedora"><i class="fas fa-user-check"></i> VENDEDORA *</label>
                        <select id="editVendedora">
                            <option value="PATRICIA" ${clienteEditando.vendedora === 'PATRICIA' ? 'selected' : ''}>PATRICIA</option>
                            <option value="JULYA" ${clienteEditando.vendedora === 'JULYA' ? 'selected' : ''}>JULYA</option>
                            <option value="NATALY" ${clienteEditando.vendedora === 'NATALY' ? 'selected' : ''}>NATALY</option>
                            <option value="EVELYN" ${clienteEditando.vendedora === 'EVELYN' ? 'selected' : ''}>EVELYN</option>
                            <option value="ISABELLE" ${clienteEditando.vendedora === 'ISABELLE' ? 'selected' : ''}>ISABELLE</option>
                            <option value="OUTRO" ${clienteEditando.vendedora === 'OUTRO' ? 'selected' : ''}>OUTRO</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button onclick="fecharModal()" class="btn btn-secondary">Cancelar</button>
            <button onclick="atualizarCliente()" class="btn btn-primary">Salvar Alterações</button>
        </div>
    `;
    
    document.getElementById('editModal').style.display = 'flex';
}

function atualizarCliente() {
    if (!clienteEditando) return;
    
    // Validar campos
    const campos = ['editCnpj', 'editMarca', 'editCliente', 'editTelefone', 'editValorTotal', 'editVendedora'];
    let valido = true;
    
    for (let campoId of campos) {
        const campo = document.getElementById(campoId);
        if (!campo.value.trim()) {
            campo.style.borderColor = '#F44336';
            valido = false;
        } else {
            campo.style.borderColor = '';
        }
    }
    
    if (!valido) {
        mostrarMensagem('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Atualizar dados
    clienteEditando.cnpj = document.getElementById('editCnpj').value;
    clienteEditando.marca = document.getElementById('editMarca').value;
    clienteEditando.cliente = document.getElementById('editCliente').value;
    clienteEditando.telefone = document.getElementById('editTelefone').value;
    clienteEditando.valorTotal = document.getElementById('editValorTotal').value;
    clienteEditando.vendedora = document.getElementById('editVendedora').value;
    
    // Salvar dados
    salvarDados();
    
    // Fechar modal e atualizar
    fecharModal();
    carregarTodosClientes();
    mostrarMensagem('Cliente atualizado com sucesso!', 'success');
    
    if (currentSection === 'dashboard') {
        atualizarDashboard();
    }
}

function deletarCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) {
        return;
    }
    
    clientes = clientes.filter(c => c.id !== id);
    salvarDados();
    carregarTodosClientes();
    atualizarContador();
    mostrarMensagem('Cliente excluído com sucesso!', 'success');
    
    if (currentSection === 'dashboard') {
        atualizarDashboard();
    }
}

function visualizarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    
    if (!cliente) return;
    
    const modalContent = document.querySelector('#editModal .modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-eye"></i> DETALHES DO CLIENTE</h3>
            <button class="btn-close" onclick="fecharModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <div style="line-height: 2;">
                <p><strong>CNPJ:</strong> ${cliente.cnpj}</p>
                <p><strong>Marca/Empresa:</strong> ${cliente.marca}</p>
                <p><strong>Cliente:</strong> ${cliente.cliente}</p>
                <p><strong>Telefone:</strong> ${cliente.telefone}</p>
                <p><strong>Valor Total:</strong> R$ ${cliente.valorTotal}</p>
                <p><strong>Valor Parcela:</strong> R$ ${cliente.valorParcela}</p>
                <p><strong>Vendedora:</strong> ${cliente.vendedora}</p>
                <p><strong>Status:</strong> ${cliente.status}</p>
                <p><strong>Data Cadastro:</strong> ${formatarData(new Date(cliente.dataCadastro))}</p>
                <p><strong>Cadastrado por:</strong> ${cliente.cadastradoPor}</p>
            </div>
        </div>
        <div class="modal-footer">
            <button onclick="fecharModal()" class="btn btn-secondary">Fechar</button>
            <button onclick="editarCliente(${cliente.id})" class="btn btn-primary">Editar</button>
        </div>
    `;
    
    document.getElementById('editModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('editModal').style.display = 'none';
    clienteEditando = null;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function limparFormulario() {
    if (!confirm('Limpar todos os dados do formulário?')) return;
    
    document.getElementById('cnpj').value = '';
    document.getElementById('marca').value = '';
    document.getElementById('cliente').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('valorTotal').value = '';
    document.getElementById('valorParcela').value = '';
    document.getElementById('vendedora').selectedIndex = 0;
    document.getElementById('possuiLogomarca').checked = false;
    document.getElementById('contratoStatus').textContent = 'Nenhum arquivo';
    document.getElementById('logomarcaStatus').textContent = 'Nenhum arquivo';
    document.getElementById('pastaStatus').textContent = 'Aguardando cadastro';
    
    document.getElementById('data').value = new Date().toISOString().split('T')[0];
    
    mostrarMensagem('Formulário limpo com sucesso!', 'info');
}

function atualizarContador() {
    const count = clientes.length;
    document.getElementById('contadorClientes').textContent = 
        `${count} cliente${count !== 1 ? 's' : ''} cadastrado${count !== 1 ? 's' : ''}`;
}

function mostrarMensagem(texto, tipo = 'info') {
    const status = document.getElementById('statusMessage');
    status.textContent = texto;
    status.className = '';
    
    switch(tipo) {
        case 'success':
            status.style.color = '#4CAF50';
            break;
        case 'error':
            status.style.color = '#F44336';
            status.classList.add('shake');
            break;
        case 'warning':
            status.style.color = '#FF9800';
            break;
        default:
            status.style.color = '#2196F3';
    }
    
    setTimeout(() => status.classList.remove('shake'), 500);
    setTimeout(() => {
        status.textContent = 'Sistema pronto para uso';
        status.style.color = '';
    }, 5000);
}

function formatarData(data) {
    try {
        return new Date(data).toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

// ============================================
// FUNÇÕES DO MENU
// ============================================

function exportarDados() {
    if (clientes.length === 0) {
        mostrarMensagem('Não há dados para exportar!', 'warning');
        return;
    }
    
    // Criar CSV
    let csv = 'CNPJ;DATA;MARCA;CLIENTE;TELEFONE;VALOR TOTAL;VALOR PARCELA;VENDEDORA;STATUS;DATA CADASTRO\n';
    
    clientes.forEach(cliente => {
        csv += `${cliente.cnpj};${cliente.data};"${cliente.marca}";"${cliente.cliente}";`;
        csv += `${cliente.telefone};${cliente.valorTotal};${cliente.valorParcela};`;
        csv += `${cliente.vendedora};${cliente.status};${cliente.dataCadastro}\n`;
    });
    
    // Criar blob e download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_fenix_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    mostrarMensagem('Dados exportados com sucesso!', 'success');
}

async function fazerBackup() {
    if (clientes.length === 0) {
        mostrarMensagem('Não há dados para backup!', 'warning');
        return;
    }
    
    const salvou = salvarDados();
    
    if (salvou) {
        mostrarMensagem('✅ Backup realizado com sucesso!', 'success');
    } else {
        mostrarMensagem('⚠️ Erro ao fazer backup', 'error');
    }
}

function configurarSistema() {
    alert(`⚙️ SISTEMA FÊNIX v${SYSTEM_CONFIG.versao}\n\n📊 Estatísticas:\n• Total de clientes: ${clientes.length}\n• Usuário atual: ${usuarioLogado.nome}\n\n💡 Dica: Faça backup regular usando "Exportar Excel"!`);
}

function abrirSuporte() {
    alert('🆘 SUPORTE TÉCNICO\n\nPara suporte, entre em contato:\n\n📧 Email: suporte@fenixsystem.com\n📞 Telefone: (11) 99999-9999');
}