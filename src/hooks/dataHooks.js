import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) { setTransactions([]); return; }
        
        // CORREÇÃO: Removemos o filtro 'where' para buscar TODAS as transações
        // e depois filtramos no código. Esta é a abordagem mais segura.
        const q = query(
            collection(db, `users/${userId}/transactions`),
            orderBy("timestamp", "desc") 
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filtramos aqui para separar as recorrentes das normais
            const normalTransactions = allTransactions.filter(t => t.isRecurring !== true);

            setTransactions(normalTransactions);
        }, (error) => {
            console.error("Erro no listener de transações: ", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return transactions;
}

export function useRecurringTransactions(userId) {
    const [recurring, setRecurring] = useState([]);
    useEffect(() => {
        if (!userId) { setRecurring([]); return; }
        const q = query(collection(db, `users/${userId}/transactions`), where("isRecurring", "==", true), orderBy("description", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRecurring(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Erro no listener de transações recorrentes: ", error);
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
            console.error("Erro no listener de dívidas: ", error);
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
            console.error("Erro no listener de orçamentos: ", error);
        });
        
        return () => unsubscribe();
    }, [userId]);
    return budgets;
}

export function useGoals(userId) {
    const [goals, setGoals] = useState([]);
    useEffect(() => {
        if (!userId) { setGoals([]); return; }
        const q = query(collection(db, `users/${user.uid}/goals`), orderBy("targetDate", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (error) => {
            console.error("Erro no listener de metas: ", error);
        });
        return () => unsubscribe();
    }, [userId]);
    return goals;
}
