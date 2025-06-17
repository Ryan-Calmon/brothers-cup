import React from 'react';
import { Link, useLocation } from 'react-router-dom';  // Importando Link e useLocation
import "../styles/header.css";
import logo from "../images/logo-brothers.png";

import Silk from './Silk';
import FuzzyText from './FuzzyText';
import MenuMobile from './MenuMobile'; 

function Header() {
  // Usando useLocation para verificar a URL atual
  const location = useLocation();
  const isHomePage = location.pathname === '/'; // Verifica se está na página principal

  return (
    <header>
      <div className='header-container'>
        <div className='row header-row align-items-center'>
          <div className='col-4'> 
            <div className='logo'>
              {/* Usando Link para navegação sem recarregar a página */}
              <Link to={isHomePage ? '#home' : '/'}>
                <img className="logoBrothers" src={logo} alt="Logo"/>
              </Link>
            </div>
          </div>
          <div className='col-4'>
            <div className='titulo'>
              <FuzzyText
                baseIntensity={0.1} 
                hoverIntensity={0.25} 
                enableHover={true}
                fontSize="30px"
              >
                BROTHERS CUP
              </FuzzyText>
            </div> 
          </div>
          <div className='col-4'>
            <div className='menu-header'>
              <MenuMobile />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
