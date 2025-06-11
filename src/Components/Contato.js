import React from "react";
import "../styles/contato.css";
import { FaInstagram } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
function Contato(){

    return(
        <div className="contato-container" id="contato">
        <h2 className="contato-titulo">Contato</h2>
        <div className="icones">
        <div className="insta">
        
         <a
        href="https://www.instagram.com/brotherscup_ftv/" // Substitua pelo link do seu Instagram
         target="_blank" // Abre o link em uma nova aba
        rel="noopener noreferrer" // Para melhorar a segurança ao abrir em uma nova aba
         >
      <FaInstagram className="icone-insta" />
    </a>
    </div>
        <div className="tiktok">
             <a
        href="https://www.instagram.com/brotherscup_ftv/" // Substitua pelo link do seu Instagram
         target="_blank" // Abre o link em uma nova aba
        rel="noopener noreferrer" // Para melhorar a segurança ao abrir em uma nova aba
         >
       <FaTiktok className="icone-tiktok"/>
        </a>
    </div>
      
        </div>

        </div>
    );
}
export default Contato;