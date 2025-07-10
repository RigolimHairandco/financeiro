import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) { 
            console.log("HOOK 'useTransactions': userId não fornecido, retornando vazio.");
            setTransactions([]); 
            return; 
        }
        
        console.log("HOOK 'useTransactions': A iniciar busca para o userId:", userId);
        
        const q = query(
            collection(db, `users/${userId}/transactions`)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`HOOK 'useTransactions': Recebeu uma resposta. Número de documentos: ${snapshot.size}`);
            
            const allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const normalTransactions = allTransactions.filter(t => t.isRecurring !== true);
            console.log(`HOOK 'useTransactions': Encontradas ${normalTransactions.length} transações normais.`);

            setTransactions(normalTransactions);

        }, (error) => {
            // ESTA É A PARTE MAIS IMPORTANTE
            console.error("!!!!!!!!!! ERRO NO LISTENER DE TRANSAÇÕES !!!!!!!!!!", error);
        });

        return () => unsubscribe();
    }, [userId]);
    return transactions;
}

// Os outros hooks permanecem iguais, mas com logs de erro também.

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
        if (!userId) {
            setBudgets([]);
            return;
        }
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
