import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) { setTransactions([]); return; }
        
        // CORREÇÃO: Removemos qualquer filtro 'where'. Buscamos TODAS as transações e ordenamos pela data.
        // Esta é a consulta mais simples e robusta possível.
        const q = query(collection(db, `users/${userId}/transactions`), orderBy("timestamp", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // O filtro para separar transações normais das recorrentes é feito DEPOIS, no código.
            // Isto garante que transações antigas (sem o campo 'isRecurring') sejam incluídas.
            const normalTransactions = allTransactions.filter(t => t.isRecurring !== true);

            setTransactions(normalTransactions);
        }, (error) => {
            // Adicionamos um log de erro mais detalhado para o caso de algo ainda falhar.
            console.error("Erro detalhado no listener de TRANSAÇÕES: ", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return transactions;
}

export function useRecurringTransactions(userId) {
    const [recurring, setRecurring] = useState([]);
    useEffect(() => {
        if (!userId) { setRecurring([]); return; }
        // Esta busca para as recorrentes está correta e pode continuar como está.
        const q = query(collection(db, `users/${userId}/transactions`), where("isRecurring", "==", true), orderBy("description", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecurring(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Erro detalhado no listener de TRANSAÇÕES RECORRENTES: ", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return recurring;
}

// As funções abaixo não precisam de alteração
export function useDebts(userId) {
    const [debts, setDebts] = useState([]);
    useEffect(() => {
        if (!userId) { setDebts([]); return; }
        const q = query(collection(db, `users/${userId}/debts`), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Erro detalhado no listener de DÍVIDAS: ", error);
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
            console.error("Erro detalhado no listener de ORÇAMENTOS: ", error);
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
            console.error("Erro detalhado no listener de METAS: ", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return goals;
}
