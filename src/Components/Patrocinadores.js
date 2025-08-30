import React from "react";
import '../styles/Patrocinadores.css';
function Patrocinadores() {
    // Array com dados dos patrocinadores e seus links do Instagram
    const patrocinadores = {
        master:[
              {
            name: "Patrocinador MASTER",
            image: "/images/BYD_Logo_Branco.png",
            instagram: "https://www.instagram.com/itavemabyd" // Substitua pelo link real
            },
        ],
        gold: [
            {
            name: "Patrocinador Ouro",
            image: "/images/logo-flying-horse-branco.webp",
            instagram: "https://www.instagram.com/flyinghorse" // Substitua pelo link real
            },
            {
            name: "Patrocinador Ouro",
            image: "/images/JAPA-NIGHT.png",
            instagram: "https://www.instagram.com/japa_night" // Substitua pelo link real
            }
        ],
        silver: [
            {
                name: "Patrocinador Prata 1",
                image: "/images/logo-fm-distribuidora.png",
                instagram: "https://www.instagram.com/distribuidoradafm" // Substitua pelo link real
            },
            {
                name: "Patrocinador Prata 2",
                image: "/images/logo -playfitness.png",
                instagram: "https://www.instagram.com/playfitness.academia" // Substitua pelo link real
            },
            {
                name: "Patrocinador Prata 3",
                image: "/images/logo-alma-de-cor.png",
                instagram: "https://www.instagram.com/almadecoresmalteria" // Substitua pelo link real
            },
            {
                name: "Patrocinador Prata 4",
                image: "/images/logo-acai.jpg",
                instagram: "https://www.instagram.com/acaipointdasul" // Substitua pelo link real
            },
            {
                name: "Patrocinador Prata 5",
                image: "/images/PokerdOBetão.png",
                instagram: "https://www.instagram.com/brotherscup_ftv" // Substitua pelo link real
            },
            {
                name: "Patrocinador Prata 6",
                image: "/images/PokerdOBetão.png",
                instagram: "https://www.instagram.com/brotherscup_ftv" // Substitua pelo link real
            },
            {
                name: "Patrocinador Prata 7",
                image: "/images/Rangel-Tatoo.png",
                instagram: "https://www.instagram.com/rangell.tattoo" // Substitua pelo link real
            },
            {
                name: "Patrocinador Prata 8",
                image: "/images/casadocelular.png",
                instagram: "https://www.instagram.com/casadocelularmeier" // Substitua pelo link real
            }
        ]
    };

    return (
        <div>
            <div className="patrocinadores-container">
                <h2 className="patrocinadores-titulo">Nossos Patrocinadores</h2>
                <div className="patrocinadores-grid">
                    {/* Patrocinador Master */}
                    <div className="patrocinadores-linha patrocinadores-linha-master">   
                        <div className="patrocinadores-coluna patrocinadores-coluna-master"> 
                            <a 
                                href={patrocinadores.master.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="patrocinadores-link"
                            >
                                <img 
                                    src={patrocinadores.master.image} 
                                    alt={patrocinadores.master.name}
                                    className="patrocinadores-imagem patrocinadores-imagem-master"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Patrocinador Ouro */}
                    <div className="patrocinadores-linha patrocinadores-linha-ouro">
                        <div className="patrocinadores-coluna patrocinadores-coluna-ouro">
                            <a 
                                href={patrocinadores.gold.instagram} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="patrocinadores-link"
                            >
                                <img 
                                    src={patrocinadores.gold.image} 
                                    alt={patrocinadores.gold.name}
                                    className="patrocinadores-imagem patrocinadores-imagem-ouro"
                                />
                            </a>
                        </div>
                    </div>

                    {/* Primeira linha de Patrocinadores Prata */}
                    <div className="patrocinadores-linha patrocinadores-linha-prata">
                        {patrocinadores.silver.slice(0, 4).map((sponsor, index) => (
                            <div key={index} className="patrocinadores-coluna-prata">
                                <a 
                                    href={sponsor.instagram} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="patrocinadores-link"
                                >
                                    <img 
                                        src={sponsor.image} 
                                        alt={sponsor.name}
                                        className="patrocinadores-imagem patrocinadores-imagem-prata"
                                    />
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Segunda linha de Patrocinadores Prata */}
                    <div className="patrocinadores-linha patrocinadores-linha-prata">
                        {patrocinadores.silver.slice(4, 8).map((sponsor, index) => (
                            <div key={index + 4} className="patrocinadores-coluna-prata">
                                <a 
                                    href={sponsor.instagram} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="patrocinadores-link"
                                >
                                    <img 
                                        src={sponsor.image} 
                                        alt={sponsor.name}
                                        className="patrocinadores-imagem patrocinadores-imagem-prata"
                                    />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                <h2 className="patrocinadores-obrigado">Saiba mais sobre nossos patrocinadores clicando na imagem!</h2>
            </div>
        </div>
    );
}

export default Patrocinadores;

