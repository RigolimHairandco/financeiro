import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- INÍCIO DO CÓDIGO DE DEBUG ---

// Log para verificar se as variáveis de ambiente estão sendo lidas
console.log("--- INICIANDO VERIFICAÇÃO DE AMBIENTE ---");
console.log("REACT_APP_API_KEY:", process.env.REACT_APP_API_KEY ? "OK" : "FALHOU");
console.log("REACT_APP_PROJECT_ID:", process.env.REACT_APP_PROJECT_ID ? "OK" : "FALHOU");
console.log("REACT_APP_AUTH_DOMAIN:", process.env.REACT_APP_AUTH_DOMAIN ? "OK" : "FALHOU");
console.log("--- FIM DA VERIFICAÇÃO DE AMBIENTE ---");

// --- FIM DO CÓDIGO DE DEBUG ---

const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
};

let app;
let auth;
let db;

try {
    console.log("Tentando inicializar o Firebase...");
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase inicializado com SUCESSO!");
} catch (error) {
    // Força o erro a aparecer no console de forma bem clara
    console.error("!!!!!!!! ERRO CRÍTICO AO INICIALIZAR O FIREBASE !!!!!!!!", error);
    throw new Error("Falha na inicialização do Firebase. Verifique as variáveis de ambiente no painel da Vercel. Erro original: " + error.message);
}

// Exporta os serviços que você vai usar em outros lugares do app
export { auth, db };
export default app;
