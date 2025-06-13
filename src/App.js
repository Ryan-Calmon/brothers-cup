import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Usando Navigate para redirecionamento
import Header from './Components/Header';
import Home from './Components/Home';
import PrimeiraEtapa from './Components/PrimeiraEtapa';
import Inscricao from './Components/FormularioInscricao';
import Lightning from './Components/Lightning';
import AdminPage from './Components/AdminPage'; // Página de admin
import LoginPage from './Components/LoginPage'; // Página de login
import Contato from './Components/Contato';
import Footer from './Components/Footer';
import Local from './Components/Local';
import Tabelas from './Components/Tabela'; // Importando a página de Tabela
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação

  const handleLogin = () => {
    setIsAuthenticated(true); // Usuário autenticado
  };

  const handleLogout = () => {
    setIsAuthenticated(false); // Deslogar o usuário
  };

  return (
    <Router>
      {/* Fundo com efeito Lightning */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: '0',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <Lightning
          hue={265}
          xOffset={0}
          speed={0.5}
          intensity={0.4}
          size={1.7}
        />
      </div>

      {/* Conteúdo principal */}
      <Header />

      <main>
        <Routes>
          {/* A página principal que contém as seções dentro */}
          <Route path="/" element={
            <div>
              <section id="inicio">
                <Home />
              </section>

              <section id="inscricao">
                <Inscricao />
              </section>
               <section id="local">
                <Local />
              </section>
                <section id="primeiraetapa">
                <PrimeiraEtapa />
              </section>
              <section id="contato">
                <Contato />
              </section>  
            </div>
          } />

          {/* Página de login */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

          {/* Página de administração protegida */}
          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <AdminPage />
              ) : (
                <Navigate to="/login" replace /> // Redireciona para a tela de login se não autenticado
              )
            }
          />

          {/* Página de Tabela */}
          <Route path="/tabelas" element={<Tabelas />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;
