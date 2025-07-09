import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) { setTransactions([]); return; }
        const q = query(collection(db, `users/${userId}/transactions`), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [userId]);
    return transactions;
}

export function useDebts(userId) {
    const [debts, setDebts] = useState([]);
    useEffect(() => {
        if (!userId) { setDebts([]); return; }
        const q = query(collection(db, `users/${userId}/debts`), orderBy("createdAt", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setDebts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        const currentMonth = new Date().toLocaleString('default', { month: '2-digit' });
        const currentYear = new Date().getFullYear();
        const monthYear = `${currentYear}-${currentMonth}`;

        const q = query(collection(db, `users/${userId}/budgets`));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Filtramos para mostrar apenas os orçamentos do mês/ano atual
            setBudgets(userBudgets.filter(b => b.month === monthYear));
        });
        
        return () => unsubscribe();
    }, [userId]);
    return budgets;
}
