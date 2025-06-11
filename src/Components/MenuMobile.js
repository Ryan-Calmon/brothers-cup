import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/MenuMobile.css';
import { IoMdMenu } from "react-icons/io";
const MenuMobile = () => {
  const [isOpen, setIsOpen] = useState(false);

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
                  <li><a href="#inicio" onClick={toggleMenu}>Início</a></li>
                  <li><a href="#inscricao" onClick={toggleMenu}>Inscrição</a></li>
                  <li><a href="#primeiraetapa"  onClick={toggleMenu}>Galeria</a></li>
                  <li><a href="#contato"  onClick={toggleMenu}>Contato</a></li>
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
