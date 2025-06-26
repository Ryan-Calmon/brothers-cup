import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
  // Inicializa isAuthenticated verificando se há um token no localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminToken') ? true : false;
  });

  // Adiciona um useEffect para reagir a mudanças no localStorage (se necessário, embora o LoginPage já lide com isso)
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('adminToken') ? true : false);
    };
    // Opcional: Adicionar um listener para o evento storage, caso o token seja removido em outra aba/janela
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // Remove o token ao deslogar
    localStorage.removeItem('adminUser'); // Remove o usuário ao deslogar
    setIsAuthenticated(false);
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

          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
           <Route path="/sucesso" element={<Sucesso onLogin={handleLogin} />} />
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


