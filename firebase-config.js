// firebase-config.js - VERSÃO COMPATÍVEL
const firebaseConfig = {
  apiKey: "AIzaSyBSEmk9d2rznzYRH4uR8sPLhgF_yDcWRRTa",
  authDomain: "sistema-fenix-d0854.firebaseapp.com",
  projectId: "sistema-fenix-d0854",
  storageBucket: "sistema-fenix-d0854.firebasestorage.app",
  messagingSenderId: "6471397011",
  appId: "1:6471397011:web:86b518538ea0bbf3feeed74",
  measurementId: "G-ZZDWBWQ6Y7"
};

// Inicializar Firebase (forma compatível)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // Se já inicializado, usa essa instância
}

// Criar referências globais
window.auth = firebase.auth();
window.db = firebase.firestore();
window.firebaseApp = firebase.app();

console.log("✅ Firebase configurado com sucesso!");
console.log("Projeto:", firebaseConfig.projectId);
