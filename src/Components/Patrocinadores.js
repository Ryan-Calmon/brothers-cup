import React from "react";
import '../styles/Patrocinadores.css';

function Patrocinadores() {
    const patrocinadores = {
        master: [
            {
                name: "Patrocinador MASTER",
                image: "/images/bydlogo.png",
                instagram: "https://www.instagram.com/itavemabyd"
            },
        ],
        gold: [
            {
                name: "Patrocinador Ouro",
                image: "/images/logo-flying-horse-branco.webp",
                instagram: "https://www.instagram.com/flyinghorse"
            },
            {
                name: "Patrocinador Ouro",
                image: "/images/JAPA-NIGHT.png",
                instagram: "https://www.instagram.com/japa_night"
            }
        ],
        silver: [
            {
                name: "Patrocinador Prata 1",
                image: "/images/logo-fm-distribuidora.png",
                instagram: "https://www.instagram.com/distribuidoradafm"
            },
            {
                name: "Patrocinador Prata 2",
                image: "/images/logo -playfitness.png",
                instagram: "https://www.instagram.com/playfitness.academia"
            },
            {
                name: "Patrocinador Prata 3",
                image: "/images/logo-alma-de-cor.png",
                instagram: "https://www.instagram.com/almadecoresmalteria"
            },
            {
                name: "Patrocinador Prata 4",
                image: "/images/logo-acai.jpg",
                instagram: "https://www.instagram.com/acaipointdasul"
            },
            {
                name: "Patrocinador Prata 5",
                image: "/images/PokerdOBetão.png",
                instagram: "https://www.instagram.com/brotherscup_ftv"
            },
            {
                name: "Patrocinador Prata 6",
                image: "/images/PokerdOBetão.png",
                instagram: "https://www.instagram.com/brotherscup_ftv"
            },
            {
                name: "Patrocinador Prata 7",
                image: "/images/Rangel-Tatoo.png",
                instagram: "https://www.instagram.com/rangell.tattoo"
            },
            {
                name: "Patrocinador Prata 8",
                image: "/images/casadocelular.png",
                instagram: "https://www.instagram.com/casadocelularmeier"
            }
        ]
    };

    return (
        <div>
            <div className="patrocinadores-container">
                <h2 className="patrocinadores-titulo">Nossos Patrocinadores</h2>
                <div className="patrocinadores-grid">
                    {/* Patrocinador Master - CORRIGIDO */}
                    <div className="patrocinadores-linha patrocinadores-linha-master">
                        {patrocinadores.master.map((sponsor, index ) => (
                            <div key={index} className="patrocinadores-coluna patrocinadores-coluna-master">
                                <a
                                    href={sponsor.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="patrocinadores-link"
                                >
                                    <img
                                        src={sponsor.image}
                                        alt={sponsor.name}
                                        className="patrocinadores-imagem patrocinadores-imagem-master"
                                    />
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Patrocinador Ouro - CORRIGIDO */}
                    <div className="patrocinadores-linha patrocinadores-linha-ouro">
                        {patrocinadores.gold.map((sponsor, index) => (
                            <div key={index} className="patrocinadores-coluna patrocinadores-coluna-ouro">
                                <a
                                    href={sponsor.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="patrocinadores-link"
                                >
                                    <img
                                        src={sponsor.image}
                                        alt={sponsor.name}
                                        className="patrocinadores-imagem patrocinadores-imagem-ouro"
                                    />
                                </a>
                            </div>
                        ))}
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
