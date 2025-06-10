import React from "react";
import imagemFundo from  '../images/imagem-fundo.jpg';
import "../styles/primeiraetapa.css";
import Gallery from "./Gallery";
import DecryptedText from './DecryptedText';
function Home(){

    return(
        <div className="primeiraetapa-container">
            <div className="titulo">
            <p>Primeira etapa</p>    
           </div>
           <div className="galeria">
            <Gallery />
           </div>
        </div>
    );

}
export default Home;