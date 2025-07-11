import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) { 
            console.log("DEBUG (useTransactions): O hook foi chamado, mas o userId ainda é nulo. Aguardando autenticação...");
            setTransactions([]); 
            return; 
        }
        
        console.log(`%cDEBUG (useTransactions): Iniciando busca de transações para o userId: ${userId}`, 'color: blue; font-weight: bold;');
        
        // Vamos usar a consulta mais simples possível para garantir que não há erros de índice.
        const q = query(
            collection(db, `users/${userId}/transactions`),
            orderBy("timestamp", "desc")
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`%cDEBUG (useTransactions): Recebeu uma resposta do Firestore!`, 'color: green; font-weight: bold;');
            console.log(`DEBUG (useTransactions): A snapshot está vazia? `, snapshot.empty);
            console.log(`DEBUG (useTransactions): Número de documentos recebidos: ${snapshot.size}`);

            if (snapshot.size > 0) {
                console.log("DEBUG (useTransactions): Detalhes dos documentos recebidos:", snapshot.docs.map(d => d.data()));
            }

            const allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const normalTransactions = allTransactions.filter(t => t.isRecurring !== true);
            console.log(`DEBUG (useTransactions): Número de transações normais após o filtro: ${normalTransactions.length}`);

            setTransactions(normalTransactions);

        }, (error) => {
            // Esta parte captura qualquer erro que o Firebase envie.
            console.error("!!!!!!!!!! ERRO NO LISTENER DE TRANSAÇÕES !!!!!!!!!!", error);
        });

        return () => unsubscribe();
    }, [userId]);
    return transactions;
}

// Manter os outros hooks como estão
export function useRecurringTransactions(userId) {
    const [recurring, setRecurring] = useState([]);
    useEffect(() => {
        if (!userId) { setRecurring([]); return; }
        const q = query(collection(db, `users/${userId}/transactions`), where("isRecurring", "==", true), orderBy("description", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecurring(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("!!!!!!!!!! ERRO NO LISTENER DE TRANSAÇÕES RECORRENTES !!!!!!!!!!", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return recurring;
}

export function useDebts(userId) {
    const [debts, setDebts] = useState([]);
    useEffect(() => {
        if (!userId) { setDebts([]); return; }
        const q = query(collection(db, `users/${userId}/debts`), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("!!!!!!!!!! ERRO NO LISTENER DE DÍVIDAS !!!!!!!!!!", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return debts;
}

export function useBudgets(userId) {
    const [budgets, setBudgets] = useState([]);
    useEffect(() => {
        if (!userId) { setBudgets([]); return; }
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const currentYear = new Date().getFullYear();
        const monthYear = `${currentYear}-${currentMonth}`;
        const q = query(collection(db, `users/${userId}/budgets`), where("month", "==", monthYear));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("!!!!!!!!!! ERRO NO LISTENER DE ORÇAMENTOS !!!!!!!!!!", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return budgets;
}

export function useGoals(userId) {
    const [goals, setGoals] = useState([]);
    useEffect(() => {
        if (!userId) { setGoals([]); return; }
        const q = query(collection(db, `users/${userId}/goals`), orderBy("targetDate", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("!!!!!!!!!! ERRO NO LISTENER DE METAS !!!!!!!!!!", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return goals;
}
