import React from "react";
import CircularGallery from './CircularGallery';
import imagemFundo from  '../images/imagem-fundo.jpg';
import "../styles/home.css";
import DecryptedText from './DecryptedText';
function Home(){

    return(
        <div className="home-container">
            <div className="titulo">
            <div style={{ marginTop: '4rem' }}>
            <DecryptedText
             text="Nossa primeira etapa!"
             animateOn="view"
             revealDirection="center"
                />
</div>
            </div>
        <div style={{ height: '600px', position: 'relative' }}>
         <CircularGallery bend={0} textColor="#ffffff" borderRadius={0.05} />
        </div>
        </div>
    );

}
export default Home;