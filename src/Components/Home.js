import React from "react";
import ImagemBanner from "../images/terceiraetapaflyer.png";
import "../styles/home.css"; // Mantenha a importação do seu CSS

function Home() {
  return (
    <div>
        <div className="home-container">
            <div className="foto-container">
                <img className="foto-divulgacao" src={ImagemBanner} />
            </div>
        </div>

    </div>
   );
}

export default Home;
