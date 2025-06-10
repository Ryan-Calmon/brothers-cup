import React from 'react';
import "../styles/header.css";
import logo from "../images/logo-brothers.png";

import Silk from './Silk';
import FuzzyText from './FuzzyText';
import MenuMobile from './MenuMobile'; 

function Header(){

return(
    <header>
    <div className='header-container'>
        <div className='row header-row align-items-center'>
            <div className='col-4'> 
                <div className='logo'>
                    <a href="#home">
                        <img className="logoBrothers"src={logo} alt="Logo"/>
                    </a>
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