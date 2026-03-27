import { Badge } from "../../Components/ui";

const CAPACIDADES = {
  "Masculino Escolinha": 24,
  "Misto Escolinha": 24,
  "Feminino Escolinha": 16,
  "Masculino Iniciante": 16,
  "Masculino Intermediário": 16,
  "Misto Iniciante": 16,
  "Misto Intermediário": 16,
  "Feminino Iniciante": 16,
};

export default function VagasModal({ inscricoes, onClose }) {
  const stats = {};

  inscricoes.forEach((i) => {
    const cat = i.categoria;
    if (!stats[cat]) stats[cat] = { total: 0, pagas: 0 };
    stats[cat].total++;
    if (i.status_pagamento === "approved") stats[cat].pagas++;
  });

  const totalInsc = inscricoes.length;
  const totalPagas = inscricoes.filter((i) => i.status_pagamento === "approved").length;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-surface-border rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-gray-950 z-10">
          <h2 className="text-lg font-bold text-white">📊 Vagas por Categoria</h2>
          <button onClick={onClose} className="text-brand-300 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-5 space-y-3">
          {Object.entries(stats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([cat, { total, pagas }]) => {
              const capacidade = CAPACIDADES[cat] || 16;
              const pct = Math.min(100, (pagas / capacidade) * 100);

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-brand-200 text-sm font-medium">{cat}</span>
                    <div className="flex gap-3 text-xs text-brand-200/60">
                      <span>Total: <strong className="text-white">{total}</strong></span>
                      <span>Pagas: <strong className="text-green-400">{pagas}</strong></span>
                      <span>Cap: <strong className="text-brand-300">{capacidade}</strong></span>
                    </div>
                  </div>
                  <div className="h-2 bg-brand-800/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        <div className="p-5 border-t border-surface-border flex justify-between items-center">
          <div className="flex gap-4 text-xs text-brand-200/60">
            <span>Total: <strong className="text-white">{totalInsc}</strong></span>
            <span>Pagas: <strong className="text-green-400">{totalPagas}</strong></span>
          </div>
          <Badge variant="info">
            {Math.round((totalPagas / Math.max(totalInsc, 1)) * 100)}% confirmados
          </Badge>
        </div>
      </div>
    </div>
  );
}
