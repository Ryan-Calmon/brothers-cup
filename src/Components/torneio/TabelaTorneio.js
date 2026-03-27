import { useState } from "react";
import { Card, Button } from "../../Components/ui";

const TABELAS = [
  { nome: "Escolinha", link: "https://challonge.com/pt_BR/brotherscup_escolinha/module" },
  { nome: "Masc. Iniciante", link: "https://challonge.com/pt_BR/brotherscup_mascIniciante/module" },
  { nome: "Masc. Intermediário", link: "https://challonge.com/pt_BR/brotherscup_mascInterMed/module" },
  { nome: "Misto Iniciante", link: "https://challonge.com/pt_BR/brotherscupMistoIniciante/module" },
  { nome: "Misto Escolinha", link: "https://challonge.com/pt_BR/brotherscup_mistoEscolinha/module" },
  { nome: "Misto Intermediário", link: "https://challonge.com/pt_BR/brotherscup_mistoIntermed/module" },
  { nome: "Fem. Iniciante", link: "https://challonge.com/pt_BR/brotherscup_femIniciante/module" },
];

export default function TabelaTorneio() {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white text-center mb-2">
        🏐 Tabelas & Chaves
      </h1>
      <p className="text-brand-200/60 text-center mb-8">
        Acompanhe os jogos e resultados em tempo real
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {TABELAS.map((tabela) => (
          <Button
            key={tabela.nome}
            variant={activeTab === tabela.nome ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab(tabela.nome)}
          >
            {tabela.nome}
          </Button>
        ))}
      </div>

      {activeTab ? (
        <Card className="overflow-hidden">
          <div className="p-3 border-b border-surface-border">
            <h3 className="text-brand-200 font-semibold text-sm">
              {activeTab}
            </h3>
          </div>
          <iframe
            src={TABELAS.find((t) => t.nome === activeTab)?.link}
            title={`Tabela - ${activeTab}`}
            className="w-full h-[600px] border-0"
          />
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-brand-200/50 text-lg">
            Selecione uma categoria acima para ver a chave do torneio
          </p>
        </Card>
      )}
    </div>
  );
}
