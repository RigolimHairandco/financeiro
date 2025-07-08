import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // Importa nossa conexão centralizada

// Hook para buscar as categorias de DESPESA
export function useExpenseCategories(userId) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (!userId) {
            setCategories([]);
            return;
        }
        // Acessa a nova coleção: users/{userId}/expenseCategories
        const q = query(collection(db, `users/${userId}/expenseCategories`), orderBy("name", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCategories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(fetchedCategories);
        });

        return () => unsubscribe();
    }, [userId]);

    return categories;
}

// Hook para buscar as categorias de RECEITA
export function useIncomeCategories(userId) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (!userId) {
            setCategories([]);
            return;
        }
        // Acessa a nova coleção: users/{userId}/incomeCategories
        const q = query(collection(db, `users/${userId}/incomeCategories`), orderBy("name", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedCategories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(fetchedCategories);
        });

        return () => unsubscribe();
    }, [userId]);

    return categories;
}
