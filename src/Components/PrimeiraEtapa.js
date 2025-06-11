import React from "react";
import "../styles/primeiraetapa.css";
import Gallery from "./Gallery";
function Home(){

    return(
        <div className="primeiraetapa-container" id="primeiraetapa" >
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