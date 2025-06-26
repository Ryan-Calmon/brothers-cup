import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdMenu } from "react-icons/io";
import { useLocation } from 'react-router-dom';  // Importando useLocation
import '../styles/MenuMobile.css';

const MenuMobile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Obtemos a localização atual da URL
  const isHomePage = location.pathname === '/';  // Verifica se estamos na página principal

  useEffect(() => {
    document.body.classList.toggle('menu-open', isOpen);
    return () => document.body.classList.remove('menu-open');
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(prev => !prev);

  return (
    <>
      {!isOpen && (
        <button className="menu-toggle" onClick={toggleMenu}><IoMdMenu/></button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Fundo escurecido ao abrir */}
            <motion.div
              className="backdrop"
              onClick={toggleMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Menu lateral */}
            <motion.div
              className="menuMobile"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="btnFechar" onClick={toggleMenu}>✖</div>
              <nav className="navbarMobile">
                <ul>
                  {/* Condição para redirecionamento */}
                  {isHomePage ? (
                    // Se estiver na página principal, usa âncoras
                    <>
                      <li><a href="#inicio" onClick={toggleMenu}>Início</a></li>
                      <li><a href="#inscricao" onClick={toggleMenu}>Inscrição</a></li>
                      <li><a href="/tabelas" onClick={toggleMenu}>Tabelas</a></li>
                      <li><a href="#local" onClick={toggleMenu}>Local</a></li>
                      <li><a href="#primeiraetapa" onClick={toggleMenu}>Galeria</a></li>
                      <li><a href="/patrocinadores" onClick={toggleMenu}>Patrocinadores</a></li>
                      <li><a href="#contato" onClick={toggleMenu}>Contato</a></li>
                    </>
                  ) : (
                    // Se não estiver na página principal, usa links de página
                    <>
                      <li><a href="/" onClick={toggleMenu}>Início</a></li>
                      <li><a href="/#inscricao" onClick={toggleMenu}>Inscrição</a></li>
                      {/* Link Tabelas (sempre vai para /tabelas) */}
                      <li><a href="/tabelas" onClick={toggleMenu}>Tabelas</a></li>
                      <li><a href="/#local" onClick={toggleMenu}>Local</a></li>
                      <li><a href="/#primeiraetapa" onClick={toggleMenu}>Galeria</a></li>
                      <li><a href="/patrocinadores" onClick={toggleMenu}>Patrocinadores</a></li>
                      <li><a href="/#contato" onClick={toggleMenu}>Contato</a></li>
                    </>
                  )}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MenuMobile;
