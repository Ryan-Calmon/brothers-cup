import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Components/Header';
import Home from './Components/Home';
import PrimeiraEtapa from './Components/PrimeiraEtapa';
import Inscricao from './Components/FormularioInscricao';
import Lightning from './Components/Lightning';
import AdminPage from './Components/AdminPage';
import LoginPage from './Components/LoginPage';
import Contato from './Components/Contato';
import Footer from './Components/Footer';
import Local from './Components/Local';
import Sucesso from './Components/Sucesso';
import Tabelas from './Components/Tabela';
import SponsorsCarousel from './Components/SponsorsCarousel';
import Patrocinadores from './Components/Patrocinadores';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verifica se há um token no localStorage na inicialização
    return !!localStorage.getItem('adminToken');
  });

  // Função para ser passada para LoginPage para atualizar o estado de autenticação
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    // O redirecionamento para /login acontecerá automaticamente devido à mudança de estado
  };

  return (
    <Router>
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

      <Header />

      <main>
        <Routes>
          <Route path="/" element={
            <div>
              <section id="inicio">
                <Home />
              </section>
              <section id="patrocinadores">
              <SponsorsCarousel />
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

          {/* Rota para a página de login, passando a função handleLogin */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/sucesso" element={<Sucesso onLogin={handleLogin} />} />

          {/* Rota protegida para a área de administração */}
          <Route
            path="/admin"
            element={
              isAuthenticated ? (
                <AdminPage onLogout={handleLogout} /> // Passa handleLogout para AdminPage
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/patrocinadores" element={<Patrocinadores />} />
          <Route path="/tabelas" element={<Tabelas />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;


