import React, { useState } from "react";
import "../styles/tabela.css"

const tabelas = [
  { nome: "Tabela Escolinha", link: "https://challonge.com/pt_BR/brotherscup_mistoEscolinha/module" },
  { nome: "Tabela Open", link: "https://seulink2.com" },
  { nome: "Tabela Masculino Iniciante", link: "https://seulink3.com" },
  { nome: "Tabela Masculino Intermediário", link: "https://seulink4.com" },
  { nome: "Tabela Misto Iniciante", link: "https://seulink5.com" },
  { nome: "Tabela Misto Escolinha", link: "https://seulink6.com" },
  { nome: "Tabela Misto Intermediário", link: "https://seulink7.com" },
  { nome: "Tabela Feminino Intermediário", link: "https://seulink8.com" },
];

export default function Tabela() {
  const [iframeLink, setIframeLink] = useState(null);

  return (
    <div>
      <div className="tabela-botoes" style={{ marginBottom: 24 }}>
        {tabelas.map((tabela, idx) => (
          <button
            key={idx}
            className="tabela-botao"
            onClick={() => setIframeLink(tabela.link)}
          >
            {tabela.nome}
          </button>
        ))}
      </div>
      {iframeLink && (
        <iframe
          src={iframeLink}
          title="Tabela"
          width="100%"
          height="600"
          style={{ border: "1px solid #ccc", borderRadius: 8 }}
        />
      )}
    </div>
  );
}