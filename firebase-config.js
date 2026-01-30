// firebase-config.js - VERSÃO SIMPLIFICADA

console.log('🔧 Iniciando configuração do Firebase...');

// Configuração do Firebase (APENAS CAMPOS ESSENCIAIS)
const firebaseConfig = {
    apiKey: "AIzaSyBSEmk9d2rznzYRH4uR8sPLhgF_yDcWRRTa",
    authDomain: "sistema-fenix-d0854.firebaseapp.com",
    projectId: "sistema-fenix-d0854"
};

// Inicializar Firebase de forma SEGURA
try {
    // Verificar se Firebase está disponível
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase não está disponível!');
        throw new Error('Firebase SDK não carregou');
    }
    
    console.log('✅ Firebase SDK disponível, versão:', firebase.SDK_VERSION);
    
    // Inicializar apenas se não estiver inicializado
    if (!firebase.apps.length) {
        console.log('🚀 Inicializando Firebase...');
        firebase.initializeApp(firebaseConfig);
    } else {
        console.log('⚡ Firebase já inicializado, usando instância existente');
        firebase.app(); // Usar instância existente
    }
    
    // Criar referências globais
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    
    console.log('🎉 Firebase configurado com sucesso!');
    console.log('Projeto:', firebaseConfig.projectId);
    
} catch (error) {
    console.error('💥 ERRO FATAL ao configurar Firebase:', error);
    console.error('Detalhes:', error.message);
    
    // Tentar carregar Firebase manualmente
    console.log('🔄 Tentando carregar Firebase manualmente...');
    
    // Criar script dinâmico
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js';
    script.onload = function() {
        console.log('✅ Firebase carregado manualmente');
        // Carregar auth e firestore
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-auth.js';
        script2.onload = function() {
            const script3 = document.createElement('script');
            script3.src = 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js';
            script3.onload = function() {
                console.log('✅ Todos os módulos Firebase carregados');
                // Tentar inicializar novamente
                if (typeof firebase !== 'undefined' && !firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                    window.auth = firebase.auth();
                    window.db = firebase.firestore();
                }
            };
            document.head.appendChild(script3);
        };
        document.head.appendChild(script2);
    };
    document.head.appendChild(script);
}
