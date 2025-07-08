const FinancialManager = ({ user, onLogout, setAlertMessage }) => {
    const transactions = useTransactions(user.uid);
    const debts = useDebts(user.uid);
    
    const [transactionToEdit, setTransactionToEdit] = useState(null);
    const [itemToDelete, setItemToDelete] = useState({id: null, type: null, data: null});
    const [filterPeriod, setFilterPeriod] = useState('month');
    const [debtToPay, setDebtToPay] = useState(null);
    // A view agora pode ser 'dashboard', 'reports', ou 'settings'
    const [view, setView] = useState('dashboard'); 

    // ... (todas as suas funções handleSaveTransaction, handleDelete, etc. continuam aqui, inalteradas)
    const handleSaveTransaction = async (data, id) => { /* ... seu código ... */ };
    const handleSaveDebt = async (data) => { /* ... seu código ... */ };
    const handleDeleteConfirmation = (id, type, data = null) => setItemToDelete({id, type, data});
    const handleDelete = async () => { /* ... seu código ... */ };
    const handleMakePayment = async (paymentAmount) => { /* ... seu código ... */ };
    const filteredTransactions = useMemo(() => { /* ... seu código ... */ }, [transactions, filterPeriod]);
    const { totalIncome, totalExpenses, balance } = useMemo(() => { /* ... seu código ... */ }, [filteredTransactions]);
    const activeDebts = useMemo(() => debts.filter(d => d.status === DEBT_STATUS.ACTIVE), [debts]);
    const totalActiveDebt = useMemo(() => activeDebts.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0), [activeDebts]);

    // O retorno do componente é a parte principal que muda
    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            <ConfirmationModal isOpen={!!itemToDelete.id} onClose={() => setItemToDelete({id: null, type: null, data: null})} onConfirm={handleDelete} title="Confirmar Exclusão" message="Tem a certeza que deseja apagar este item? Esta ação não pode ser desfeita." />
            <PaymentModal isOpen={!!debtToPay} onClose={() => setDebtToPay(null)} onConfirm={handleMakePayment} debt={debtToPay} />
            
            <header className="bg-white shadow-sm sticky top-0 z-20 no-print">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Icon name="wallet" className="text-indigo-600" size={32} />
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">O Meu Gestor</h1>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* Botão de Relatórios */}
                        <button onClick={() => setView('reports')} title="Relatórios" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
                            <Icon name="barChart" size={20} />
                        </button>
                        {/* NOVO: Botão de Configurações */}
                        <button onClick={() => setView('settings')} title="Configurações" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors">
                            <Icon name="settings" size={20} />
                        </button>
                        <div className="text-right"><p className="text-sm text-gray-600 truncate max-w-[150px] md:max-w-full">{user.email}</p></div>
                        <button onClick={onLogout} title="Sair" className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                            <Icon name="logOut" size={20} />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Lógica para decidir qual página mostrar */}
            {view === 'dashboard' && (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {/* ... Todo o seu código do dashboard principal vai aqui ... */}
                  {/* (A seção com os SummaryCard, TransactionForm, etc.) */}
                </main>
            )}

            {view === 'reports' && <Reports transactions={transactions} />}

            {view === 'settings' && <SettingsPage setView={setView} />}
        </div>
    );
};
