import React from "react";
import ImagemBanner from "../images/Feed Divulgação Certo 8 duplas.webp";
import ImagemBannerPC from "../images/Feed Divulgação Certo 8 duplas.webp";
import "../styles/home.css";
function Home(){



    return(
    <div>
        <div className="home-container">
            <div className="foto-container">
                <img className="foto-divulgacao" src={ImagemBanner} />
                 <img className="foto-divulgacao-pc" src={ImagemBannerPC} />
            </div>
        </div>

    </div>
    );
}
export default Home;