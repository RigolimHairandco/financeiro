import React from 'react';

// Vamos exportar um componente de teste extremamente simples.
// Ele não tem hooks, não tem estados, não tem nada além de HTML.
export default function App() {
  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif', fontSize: '24px', textAlign: 'center', color: '#333' }}>
      <h1>Teste de Renderização do React</h1>
      <p style={{ marginTop: '20px' }}>Se você consegue ler esta mensagem, a base da sua aplicação está funcionando corretamente.</p>
    </div>
  );
}
