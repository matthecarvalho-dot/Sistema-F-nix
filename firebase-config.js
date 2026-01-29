// firebase-config.js
// Configuração do Firebase para o Sistema Fênix

// SUAS CREDENCIAIS - VERIFIQUE OS NÚMEROS!
const firebaseConfig = {
  apiKey: "AIzaSyBSEmk9d2rznzYRH4uR8sPLhgF_yDcWRRTa",
  authDomain: "sistema-fenix-d0854.firebaseapp.com",
  projectId: "sistema-fenix-d0854",
  storageBucket: "sistema-fenix-d0854.firebasestorage.app",
  messagingSenderId: "6471397011",
  appId: "1:6471397011:web:86b518538ea0bbf3feeed74",
  measurementId: "G-ZZDWBWQ6Y7"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar para uso global
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("✅ Firebase configurado com sucesso!");
