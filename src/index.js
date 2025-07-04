import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // Importa o nosso componente principal

const container = document.getElementById('root');
const root = createRoot(container);

// Renderiza o nosso componente principal
root.render(
    <App />
);
