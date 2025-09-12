import React, { useState } from "react";
import "../styles/tabela.css"

const tabelas = [
  { nome: "Escolinha", link: "https://challonge.com/pt_BR/brotherscup_escolinha/module" },
  { nome: "Masculino Iniciante", link: "https://challonge.com/pt_BR/brotherscup_mascIniciante/module" },
  { nome: "Masculino Intermediário", link: "https://challonge.com/pt_BR/brotherscup_mascInterMed/module" },
  { nome: "Misto Iniciante", link: "https://challonge.com/pt_BR/brotherscup_mistoInic/module" },
  { nome: "Misto Escolinha", link: "https://challonge.com/pt_BR/brotherscup_mistoEscolinha/module" },
  { nome: "Misto Intermediário", link: "https://challonge.com/pt_BR/brotherscup_mistoIntermed/module" },
  { nome: "Feminino Iniciante", link: "https://challonge.com/pt_BR/brotherscup_femIniciante/module" },
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