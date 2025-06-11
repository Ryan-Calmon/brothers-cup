import React from "react";
import "../styles/Gallery.css";
import imagem1 from "../images/imagem-1.webp";
import imagem2 from "../images/imagem-2.webp";
import imagem3 from "../images/imagem-3.webp";
import imagem4 from "../images/imagem-4.webp";
import imagem5 from "../images/imagem-5.webp";
import imagem6 from "../images/imagem-6.webp";
import imagem7 from "../images/imagem-7.webp";
import imagem8 from "../images/imagem-8.webp";
import imagem9 from "../images/imagem-9.webp";
import imagemfundo from "../images/imagem-fundo.webp";
const imageUrls = [
  imagem1,
  imagem2,
  imagem3,
  imagem7,
  imagemfundo,
  imagem5,
  imagem6,
  imagem4,
  imagem8,
  imagem9,
 
];

const Gallery = () => {
  return (
    <ul className="results">
      {imageUrls.map((url, i) => (
        <li className="result" key={i}>
            <img src={url} width="500" height="500" alt={`imagem-${i}`} />
        </li>
      ))}
    </ul>
  );
};

export default Gallery;
