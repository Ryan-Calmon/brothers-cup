import React from "react";
import "../styles/Gallery.css";

function Gallery(){
  return (
    <div>
      <div className="Galeria-container">
        <h1 className="tituloGaleria">FOTOS SEGUNDA ETAPA</h1>
      <div className="botoes-container">
        {/* Botão 1: Link para as fotos do primeiro dia */}
        <a
          href="https://drive.google.com/drive/folders/1IPlbyE8pnIJrxYVrnZ31pO8SJZPWXZDo?fbclid=PAZXh0bgNhZW0CMTEAAaecLruTxQJZXSCcoROojVuntvNwx2WyM8OA5G1XACqXVS7c5Yu_03f7oDTT_A_aem_NP5NfgJHvy2RNI93dPadLw" // <-- TROQUE PELO LINK REAL
          target="_blank" // Abre o link em uma nova aba
          rel="noopener noreferrer" // Boa prática de segurança para links
          className="btn btn-fotos"
        >
          FOTOS DO DIA 1
        </a>

        <a
          href="https://drive.google.com/drive/folders/1pZuEdsrrDzbzJtZTqnDdBrlau6UboXI0?fbclid=PAZXh0bgNhZW0CMTEAAadQu7Y2RFwIQEh8vSLReHPDMNkNxw7oUyNikY0_PqlYxipeRmspJItUlz4Jww_aem_5IFqGSvrOgK3WbGPFNHedQ" // <-- TROQUE PELO LINK REAL
          target="_blank" // Abre o link em uma nova aba
          rel="noopener noreferrer" // Boa prática de segurança para links
          className="btn btn-fotos"
        >
          FOTOS DO DIA 2
        </a>
      </div>
    </div>
    </div>
  );
};

export default Gallery;
