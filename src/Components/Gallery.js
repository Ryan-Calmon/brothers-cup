import React from "react";
import "../styles/Gallery.css";
import containerfotos from "../images/container-fotos.webp";
import containerfotosPC from "../images/container-fotos-pc.webp";

function Gallery(){
  return (
    <div>
      <div className="Galeria-container">
        <img className="fotos-mobile" src={containerfotos} alt="fotos"/>
        <img className="fotos-pc "src={containerfotosPC} alt="fotos" />
      </div>
    </div>
  );
};

export default Gallery;
