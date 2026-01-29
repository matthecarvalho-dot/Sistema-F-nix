// clientes-db.js
// Sistema de Banco de Dados de Clientes para Sistema Fênix

// ====================
// VARIÁVEIS GLOBAIS
// ====================

let clientesCache = []; // Cache de clientes para performance
let listenerClientes = null; // Listener em tempo real

// ====================
// FUNÇÕES PRINCIPAIS - CRUD
// ====================

// Salvar cliente no banco de dados
async function salvarClienteNoBanco(clienteData) {
    const user = auth.currentUser;
    
    if (!user) {
        mostrarMensagemDB('Faça login para salvar clientes', 'error');
        return null;
    }

    // Validação básica
    if (!clienteData.cnpj || !clienteData.marca || !clienteData.cliente) {
        mostrarMensagemDB('Preencha CNPJ, Marca e Cliente', 'error');
        return null;
    }

    try {
        // Formatar dados
        const dadosFormatados = {
            ...clienteData,
            cnpj: formatarCNPJ(clienteData.cnpj),
            telefone: formatarTelefone(clienteData.telefone),
            valorTotal: formatarMoeda(clienteData.valorTotal),
            valorParcela: formatarMoeda(clienteData.valorParcela),
            dataContrato: clienteData.dataContrato || new Date().toISOString().split('T')[0],
            usuarioId: user.uid,
            dataCriacao: new Date(),
            dataAtualizacao: new Date(),
            status: clienteData.status || 'Ativo',
            criadoPor: user.email
        };

        // Gerar ID único
        const clienteId = gerarIdCliente(dadosFormatados.cnpj);
        
        // Salvar no Firestore
        await db.collection('usuarios')
                .doc(user.uid)
                .collection('clientes')
                .doc(clienteId)
                .set(dadosFormatados);

        console.log('✅ Cliente salvo:', clienteId, dadosFormatados.marca);
        
        // Atualizar contador
        await atualizarContadorClientes(user.uid, 1);
        
        // Atualizar cache
        clientesCache.unshift({ id: clienteId, ...dadosFormatados });
        
        mostrarMensagemDB(`Cliente "${dadosFormatados.marca}" salvo com sucesso!`, 'success');
        return clienteId;
        
    } catch (error) {
        console.error('❌ Erro ao salvar cliente:', error);
        mostrarMensagemDB('Erro ao salvar cliente: ' + error.message, 'error');
        return null;
    }
}

// Buscar todos os clientes do usuário
async function buscarClientesDoUsuario(filtros = {}) {
    const user = auth.currentUser;
    
    if (!user) {
        console.log('Usuário não autenticado');
        return [];
    }

    try {
        let query = db.collection('usuarios')
                     .doc(user.uid)
                     .collection('clientes');

        // Aplicar filtros
        if (filtros.vendedora) {
            query = query.where('vendedora', '==', filtros.vendedora);
        }
        
        if (filtros.status && filtros.status !== 'Todos') {
            query = query.where('status', '==', filtros.status);
        }
        
        if (filtros.dataInicio && filtros.dataFim) {
            query = query.where('dataContrato', '>=', filtros.dataInicio)
                        .where('dataContrato', '<=', filtros.dataFim);
        }

        // Ordenar por data de criação (mais recentes primeiro)
        query = query.orderBy('dataCriacao', 'desc');

        const snapshot = await query.get();
        const clientes = [];
        
        snapshot.forEach(doc => {
            clientes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Atualizar cache
        clientesCache = clientes;
        
        console.log(`📋 ${clientes.length} clientes encontrados`);
        return clientes;
        
    } catch (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        mostrarMensagemDB('Erro ao carregar clientes', 'error');
        return [];
    }
}

// Atualizar cliente existente
async function atualizarClienteNoBanco(clienteId, dadosAtualizados) {
    const user = auth.currentUser;
    
    if (!user) {
        mostrarMensagemDB('Faça login para atualizar clientes', 'error');
        return false;
    }

    try {
        // Preparar dados atualizados
        const dadosParaAtualizar = {
            ...dadosAtualizados,
            dataAtualizacao: new Date()
        };

        // Formatar campos específicos se existirem
        if (dadosParaAtualizar.cnpj) {
            dadosParaAtualizar.cnpj = formatarCNPJ(dadosParaAtualizar.cnpj);
        }
        
        if (dadosParaAtualizar.telefone) {
            dadosParaAtualizar.telefone = formatarTelefone(dadosParaAtualizar.telefone);
        }
        
        if (dadosParaAtualizar.valorTotal) {
            dadosParaAtualizar.valorTotal = formatarMoeda(dadosParaAtualizar.valorTotal);
        }

        // Atualizar no Firestore
        await db.collection('usuarios')
                .doc(user.uid)
                .collection('clientes')
                .doc(clienteId)
                .update(dadosParaAtualizar);

        console.log('✅ Cliente atualizado:', clienteId);
        
        // Atualizar cache
        const index = clientesCache.findIndex(c => c.id === clienteId);
        if (index !== -1) {
            clientesCache[index] = { ...clientesCache[index], ...dadosParaAtualizar };
        }
        
        mostrarMensagemDB('Cliente atualizado com sucesso!', 'success');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao atualizar cliente:', error);
        mostrarMensagemDB('Erro ao atualizar cliente', 'error');
        return false;
    }
}

// Excluir cliente
async function excluirClienteDoBanco(clienteId) {
    const user = auth.currentUser;
    
    if (!user) {
        mostrarMensagemDB('Faça login para excluir clientes', 'error');
        return false;
    }

    // Confirmar exclusão
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        return false;
    }

    try {
        // Buscar dados do cliente antes de excluir (para log)
        const clienteDoc = await db.collection('usuarios')
                                 .doc(user.uid)
                                 .collection('clientes')
                                 .doc(clienteId)
                                 .get();
        
        const clienteData = clienteDoc.exists ? clienteDoc.data() : null;
        
        // Excluir do Firestore
        await db.collection('usuarios')
                .doc(user.uid)
                .collection('clientes')
                .doc(clienteId)
                .delete();

        console.log('🗑️ Cliente excluído:', clienteId);
        
        // Atualizar contador
        await atualizarContadorClientes(user.uid, -1);
        
        // Remover do cache
        clientesCache = clientesCache.filter(c => c.id !== clienteId);
        
        // Log da exclusão
        if (clienteData) {
            await db.collection('usuarios')
                    .doc(user.uid)
                    .collection('logs')
                    .add({
                        acao: 'exclusao_cliente',
                        clienteId: clienteId,
                        clienteNome: clienteData.marca || 'Desconhecido',
                        data: new Date(),
                        usuario: user.email
                    });
        }
        
        mostrarMensagemDB('Cliente excluído com sucesso!', 'success');
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao excluir cliente:', error);
        mostrarMensagemDB('Erro ao excluir cliente', 'error');
        return false;
    }
}

// Buscar cliente por ID
async function buscarClientePorId(clienteId) {
    const user = auth.currentUser;
    
    if (!user) {
        return null;
    }

    // Verificar cache primeiro
    const clienteCache = clientesCache.find(c => c.id === clienteId);
    if (clienteCache) {
        return clienteCache;
    }

    try {
        const doc = await db.collection('usuarios')
                          .doc(user.uid)
                          .collection('clientes')
                          .doc(clienteId)
                          .get();

        if (doc.exists) {
            const cliente = { id: doc.id, ...doc.data() };
            
            // Adicionar ao cache
            clientesCache.push(cliente);
            
            return cliente;
        }
        return null;
    } catch (error) {
        console.error('❌ Erro ao buscar cliente:', error);
        return null;
    }
}

// ====================
// LISTENERS EM TEMPO REAL
// ====================

// Iniciar listener em tempo real para clientes
function iniciarListenerClientes() {
    const user = auth.currentUser;
    
    if (!user || listenerClientes) {
        return;
    }

    try {
        listenerClientes = db.collection('usuarios')
                           .doc(user.uid)
                           .collection('clientes')
                           .orderBy('dataCriacao', 'desc')
                           .onSnapshot((snapshot) => {
            const changes = snapshot.docChanges();
            
            changes.forEach(change => {
                const cliente = { id: change.doc.id, ...change.doc.data() };
                
                if (change.type === 'added') {
                    console.log('📥 Cliente adicionado:', cliente.marca);
                    // Adicionar ao cache se não existir
                    if (!clientesCache.find(c => c.id === cliente.id)) {
                        clientesCache.unshift(cliente);
                    }
                }
                
                if (change.type === 'modified') {
                    console.log('🔄 Cliente modificado:', cliente.marca);
                    // Atualizar no cache
                    const index = clientesCache.findIndex(c => c.id === cliente.id);
                    if (index !== -1) {
                        clientesCache[index] = cliente;
                    }
                }
                
                if (change.type === 'removed') {
                    console.log('🗑️ Cliente removido:', cliente.id);
                    // Remover do cache
                    clientesCache = clientesCache.filter(c => c.id !== cliente.id);
                }
            });
            
            // Atualizar interface se necessário
            if (typeof atualizarListaClientesUI === 'function') {
                atualizarListaClientesUI(clientesCache);
            }
            
            // Atualizar contador na interface
            atualizarContadorUI(clientesCache.length);
            
        }, (error) => {
            console.error('❌ Erro no listener:', error);
        });
        
        console.log('👂 Listener de clientes iniciado');
        
    } catch (error) {
        console.error('❌ Erro ao iniciar listener:', error);
    }
}

// Parar listener
function pararListenerClientes() {
    if (listenerClientes) {
        listenerClientes();
        listenerClientes = null;
        console.log('👂 Listener de clientes parado');
    }
}

// ====================
// FUNÇÕES DE BUSCA E FILTRO
// ====================

// Buscar clientes por termo
async function buscarClientesPorTermo(termo) {
    if (!termo || termo.trim() === '') {
        return buscarClientesDoUsuario();
    }

    const user = auth.currentUser;
    if (!user) return [];

    try {
        // Buscar por CNPJ (exato)
        const queryCNPJ = db.collection('usuarios')
                          .doc(user.uid)
                          .collection('clientes')
                          .where('cnpj', '==', termo.replace(/\D/g, ''));

        // Buscar por marca (contém)
        const queryMarca = db.collection('usuarios')
                           .doc(user.uid)
                           .collection('clientes')
                           .where('marca', '>=', termo)
                           .where('marca', '<=', termo + '\uf8ff');

        // Buscar por nome do cliente (contém)
        const queryCliente = db.collection('usuarios')
                             .doc(user.uid)
                             .collection('clientes')
                             .where('cliente', '>=', termo)
                             .where('cliente', '<=', termo + '\uf8ff');

        // Buscar por telefone (contém)
        const queryTelefone = db.collection('usuarios')
                              .doc(user.uid)
                              .collection('clientes')
                              .where('telefone', '>=', termo.replace(/\D/g, ''))
                              .where('telefone', '<=', termo.replace(/\D/g, '') + '\uf8ff');

        // Executar todas as queries
        const [cnpjSnapshot, marcaSnapshot, clienteSnapshot, telefoneSnapshot] = await Promise.all([
            queryCNPJ.get(),
            queryMarca.get(),
            queryCliente.get(),
            queryTelefone.get()
        ]);

        // Combinar resultados
        const resultados = new Map();
        
        [cnpjSnapshot, marcaSnapshot, clienteSnapshot, telefoneSnapshot].forEach(snapshot => {
            snapshot.forEach(doc => {
                if (!resultados.has(doc.id)) {
                    resultados.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });
        });

        return Array.from(resultados.values());
        
    } catch (error) {
        console.error('❌ Erro na busca:', error);
        return [];
    }
}

// Filtrar clientes por múltiplos critérios
async function filtrarClientesAvancado(filtros) {
    const user = auth.currentUser;
    if (!user) return [];

    try {
        let query = db.collection('usuarios')
                     .doc(user.uid)
                     .collection('clientes');

        // Aplicar filtros dinamicamente
        if (filtros.vendedora && filtros.vendedora !== 'Todas') {
            query = query.where('vendedora', '==', filtros.vendedora);
        }
        
        if (filtros.status && filtros.status !== 'Todos') {
            query = query.where('status', '==', filtros.status);
        }
        
        if (filtros.dataInicio) {
            query = query.where('dataContrato', '>=', filtros.dataInicio);
        }
        
        if (filtros.dataFim) {
            query = query.where('dataContrato', '<=', filtros.dataFim);
        }
        
        if (filtros.valorMin) {
            query = query.where('valorTotal', '>=', parseFloat(filtros.valorMin));
        }
        
        if (filtros.valorMax) {
            query = query.where('valorTotal', '<=', parseFloat(filtros.valorMax));
        }

        const snapshot = await query.orderBy('dataCriacao', 'desc').get();
        const clientes = [];
        
        snapshot.forEach(doc => {
            clientes.push({ id: doc.id, ...doc.data() });
        });

        return clientes;
        
    } catch (error) {
        console.error('❌ Erro ao filtrar:', error);
        return [];
    }
}

// ====================
// ESTATÍSTICAS E RELATÓRIOS
// ====================

// Obter estatísticas dos clientes
async function obterEstatisticasClientes() {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const clientes = await buscarClientesDoUsuario();
        
        const estatisticas = {
            total: clientes.length,
            ativos: clientes.filter(c => c.status === 'Ativo').length,
            inativos: clientes.filter(c => c.status === 'Inativo').length,
            pendentes: clientes.filter(c => c.status === 'Pendente').length,
            
            porVendedora: {},
            faturamentoTotal: 0,
            mediaValor: 0
        };

        // Calcular por vendedora
        clientes.forEach(cliente => {
            if (cliente.vendedora) {
                if (!estatisticas.porVendedora[cliente.vendedora]) {
                    estatisticas.porVendedora[cliente.vendedora] = 0;
                }
                estatisticas.porVendedora[cliente.vendedora]++;
            }
            
            // Calcular faturamento
            if (cliente.valorTotal) {
                const valor = parseFloat(cliente.valorTotal.replace(/[^\d,]/g, '').replace(',', '.'));
                if (!isNaN(valor)) {
                    estatisticas.faturamentoTotal += valor;
                }
            }
        });

        // Calcular média
        estatisticas.mediaValor = estatisticas.total > 0 ? 
            estatisticas.faturamentoTotal / estatisticas.total : 0;

        return estatisticas;
        
    } catch (error) {
        console.error('❌ Erro ao calcular estatísticas:', error);
        return null;
    }
}

// Exportar clientes para CSV
function exportarClientesParaCSV(clientes) {
    if (!clientes || clientes.length === 0) {
        mostrarMensagemDB('Nenhum cliente para exportar', 'warning');
        return;
    }

    try {
        // Cabeçalhos do CSV
        const cabecalhos = [
            'CNPJ', 'Marca', 'Cliente', 'Telefone', 
            'Data Contrato', 'Valor Total', 'Valor Parcela',
            'Vendedora', 'Status', 'Data Cadastro'
        ];

        // Dados
        const linhas = clientes.map(cliente => [
            cliente.cnpj || '',
            cliente.marca || '',
            cliente.cliente || '',
            cliente.telefone || '',
            cliente.dataContrato || '',
            cliente.valorTotal || '',
            cliente.valorParcela || '',
            cliente.vendedora || '',
            cliente.status || '',
            cliente.dataCriacao ? new Date(cliente.dataCriacao.seconds * 1000).toLocaleDateString() : ''
        ]);

        // Combinar
        const csvContent = [
            cabecalhos.join(','),
            ...linhas.map(linha => linha.map(campo => `"${campo}"`).join(','))
        ].join('\n');

        // Criar blob e download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `clientes_fenix_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        mostrarMensagemDB(`Exportados ${clientes.length} clientes para CSV`, 'success');
        
    } catch (error) {
        console.error('❌ Erro ao exportar CSV:', error);
        mostrarMensagemDB('Erro ao exportar dados', 'error');
    }
}

// ====================
// FUNÇÕES AUXILIARES
// ====================

// Atualizar contador de clientes do usuário
async function atualizarContadorClientes(userId, incremento = 0) {
    try {
        const userRef = db.collection('usuarios').doc(userId);
        
        if (incremento !== 0) {
            await userRef.update({
                clientesCount: firebase.firestore.FieldValue.increment(incremento)
            });
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar contador:', error);
    }
}

// Gerar ID único para cliente
function gerarIdCliente(cnpj) {
    const cnpjLimpo = cnpj ? cnpj.replace(/\D/g, '') : '';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    
    return `cliente_${cnpjLimpo || 'semcnpj'}_${timestamp}_${random}`;
}

// Formatar CNPJ
function formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    
    const numeros = cnpj.replace(/\D/g, '');
    
    if (numeros.length === 14) {
        return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return numeros;
}

// Formatar telefone
function formatarTelefone(telefone) {
    if (!telefone) return '';
    
    const numeros = telefone.replace(/\D/g, '');
    
    if (numeros.length === 11) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numeros.length === 10) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return numeros;
}

// Formatar moeda
function formatarMoeda(valor) {
    if (!valor) return '0,00';
    
    // Remove tudo que não é número, ponto ou vírgula
    let numero = valor.toString().replace(/[^\d,.-]/g, '');
    
    // Converte para número
    numero = parseFloat(numero.replace(',', '.'));
    
    if (isNaN(numero)) {
        return '0,00';
    }
    
    // Formata como moeda brasileira
    return numero.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Mostrar mensagens do banco de dados
function mostrarMensagemDB(texto, tipo = 'info') {
    const cores = {
        success: '#28a745',
        error: '#dc3545',
        info: '#17a2b8',
        warning: '#ffc107'
    };
    
    const mensagemDiv = document.createElement('div');
    mensagemDiv.textContent = texto;
    mensagemDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${cores[tipo] || '#17a2b8'};
        color: white;
        border-radius: 6px;
        z-index: 9999;
        font-weight: 500;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideUpDB 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(mensagemDiv);
    
    setTimeout(() => {
        mensagemDiv.style.animation = 'slideDownDB 0.3s ease-in';
        setTimeout(() => {
            if (mensagemDiv.parentNode) {
                document.body.removeChild(mensagemDiv);
            }
        }, 300);
    }, 4000);
    
    // Adicionar estilos se não existirem
    if (!document.querySelector('#db-message-styles')) {
        const style = document.createElement('style');
        style.id = 'db-message-styles';
        style.textContent = `
            @keyframes slideUpDB {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideDownDB {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Atualizar contador na interface
function atualizarContadorUI(quantidade) {
    const elementos = [
        document.getElementById('contadorClientes'),
        document.getElementById('dataInfo'),
        document.getElementById('totalClientes')
    ];
    
    elementos.forEach(elemento => {
        if (elemento) {
            if (elemento.id === 'totalClientes') {
                elemento.textContent = quantidade;
            } else {
                elemento.textContent = `${quantidade} ${quantidade === 1 ? 'cliente' : 'clientes'}`;
            }
        }
    });
}

// ====================
// INICIALIZAÇÃO
// ====================

// Inicializar sistema quando usuário fizer login
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('🔄 Iniciando sistema de banco de dados para:', user.email);
        
        // Iniciar listener em tempo real
        setTimeout(() => {
            iniciarListenerClientes();
            
            // Carregar clientes inicialmente
            buscarClientesDoUsuario().then(clientes => {
                console.log(`📊 ${clientes.length} clientes carregados inicialmente`);
            });
        }, 1000);
    } else {
        // Parar listener quando usuário sair
        pararListenerClientes();
        clientesCache = [];
    }
});

// ====================
// EXPORTAR FUNÇÕES
// ====================

// Tornar funções disponíveis globalmente
window.salvarClienteNoBanco = salvarClienteNoBanco;
window.buscarClientesDoUsuario = buscarClientesDoUsuario;
window.atualizarClienteNoBanco = atualizarClienteNoBanco;
window.excluirClienteDoBanco = excluirClienteDoBanco;
window.buscarClientePorId = buscarClientePorId;
window.buscarClientesPorTermo = buscarClientesPorTermo;
window.filtrarClientesAvancado = filtrarClientesAvancado;
window.obterEstatisticasClientes = obterEstatisticasClientes;
window.exportarClientesParaCSV = exportarClientesParaCSV;
window.formatarCNPJ = formatarCNPJ;
window.formatarTelefone = formatarTelefone;
window.formatarMoeda = formatarMoeda;

console.log("✅ Sistema de banco de dados de clientes carregado com sucesso!");
