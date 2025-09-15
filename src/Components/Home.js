import React from "react";
import "../styles/home.css"; // Mantenha a importação do seu CSS

function Home() {
  return (
    <div className="home-container">
        <h1 className="titulohome">FOTOS SEGUNDA ETAPA</h1>
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

        {/* Botão 2: Desabilitado, para o segundo dia */}
        <button className="btn btn-em-breve" disabled>
          FOTOS DIA 2 - EM BREVE
        </button>
      </div>
    </div>
   );
}

export default Home;
