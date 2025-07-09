import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useTransactions(userId) {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        if (!userId) { setTransactions([]); return; }
        
        // CORREÇÃO: Em vez de procurar por "isRecurring == false",
        // procuramos por "isRecurring != true". Isso inclui os documentos
        // onde o campo é 'false' e também os documentos antigos onde o campo nem existe.
        const q = query(collection(db, `users/${userId}/transactions`), where("isRecurring", "!=", true), orderBy("isRecurring"), orderBy("timestamp", "desc"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

        const q = query(collection(db, `users/${userId}/budgets`));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBudgets(userBudgets.filter(b => b.month === monthYear));
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
        });
        return () => unsubscribe();
    }, [userId]);
    return goals;
}
