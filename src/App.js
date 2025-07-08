import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FinancialManager from "./FinancialManager.jsx";

function App() {
  useEffect(() => {
    document.title = "Gestor Financeiro";
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<FinancialManager />} />
      </Routes>
    </Router>
  );
}

export default App;
