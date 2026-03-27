import { useState } from "react";
import { Button, Input, Select } from "../../Components/ui";

const TAMANHOS = [
  "", "PP Masculino", "P Masculino", "M Masculino", "G Masculino",
  "GG Masculino", "XG Masculino", "PP Feminino", "P Feminino",
  "M Feminino", "G Feminino", "GG Feminino", "XG Feminino",
  "Personalizado", "Segunda Inscrição",
];

const CATEGORIAS = [
  "Feminino Escolinha", "Masculino Escolinha", "Feminino Iniciante",
  "Misto Escolinha", "Misto Iniciante", "Misto Intermediário",
  "Masculino Iniciante", "Masculino Intermediário",
];

const INITIAL = {
  representante: "",
  parceiro: "",
  celular: "",
  categoria: "",
  instagram_representante: "",
  instagram_parceiro: "",
  ct_representante: "",
  ct_parceiro: "",
  uniforme_representante: "",
  uniforme_parceiro: "",
  status_pagamento: "approved",
  segunda_inscricao_rep: false,
  segunda_inscricao_parc: false,
  observacao: "",
};

export default function CreateModal({ onCreate, onClose }) {
  const [data, setData] = useState({ ...INITIAL });
  const [customRepUniform, setCustomRepUniform] = useState("");
  const [customParcUniform, setCustomParcUniform] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newData = { ...data, [name]: type === "checkbox" ? checked : value };

    if (name === "segunda_inscricao_rep" && checked) {
      newData.uniforme_representante = "Segunda Inscrição";
    }
    if (name === "segunda_inscricao_parc" && checked) {
      newData.uniforme_parceiro = "Segunda Inscrição";
    }

    setData(newData);
  };

  const handleSave = async () => {
    if (!data.representante || !data.parceiro || !data.categoria) {
      setError("Preencha representante, parceiro e categoria.");
      return;
    }
    setError("");

    const toSave = { ...data };
    if (toSave.uniforme_representante === "Personalizado")
      toSave.uniforme_representante = customRepUniform;
    if (toSave.uniforme_parceiro === "Personalizado")
      toSave.uniforme_parceiro = customParcUniform;

    setSaving(true);
    try {
      await onCreate(toSave);
    } catch (err) {
      setError(err.message || "Erro ao criar inscrição");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-gray-950 z-10">
          <h2 className="text-lg font-bold text-white">
            ➕ Nova Inscrição (Admin)
          </h2>
          <button onClick={onClose} className="text-brand-300 hover:text-white text-xl">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Representante *" name="representante" value={data.representante} onChange={handleChange} />
            <Input label="Parceiro *" name="parceiro" value={data.parceiro} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Celular" name="celular" value={data.celular} onChange={handleChange} />
            <Select label="Categoria *" name="categoria" value={data.categoria} onChange={handleChange}>
              <option value="">Selecione</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Instagram Rep." name="instagram_representante" value={data.instagram_representante} onChange={handleChange} />
            <Input label="Instagram Parc." name="instagram_parceiro" value={data.instagram_parceiro} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="CT Representante" name="ct_representante" value={data.ct_representante} onChange={handleChange} />
            <Input label="CT Parceiro" name="ct_parceiro" value={data.ct_parceiro} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select label="Uniforme Rep." name="uniforme_representante" value={data.uniforme_representante} onChange={handleChange}>
                {TAMANHOS.map((t) => (
                  <option key={t} value={t}>{t || "Selecione"}</option>
                ))}
              </Select>
              {data.uniforme_representante === "Personalizado" && (
                <Input className="mt-2" placeholder="Tamanho personalizado" value={customRepUniform} onChange={(e) => setCustomRepUniform(e.target.value)} />
              )}
            </div>
            <div>
              <Select label="Uniforme Parc." name="uniforme_parceiro" value={data.uniforme_parceiro} onChange={handleChange}>
                {TAMANHOS.map((t) => (
                  <option key={t} value={t}>{t || "Selecione"}</option>
                ))}
              </Select>
              {data.uniforme_parceiro === "Personalizado" && (
                <Input className="mt-2" placeholder="Tamanho personalizado" value={customParcUniform} onChange={(e) => setCustomParcUniform(e.target.value)} />
              )}
            </div>
          </div>

          <Select label="Status Pagamento" name="status_pagamento" value={data.status_pagamento} onChange={handleChange}>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="metade_pago">Metade Pago</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="campeao">🏆 Campeão (Isento)</option>
          </Select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer text-brand-200 text-sm">
              <input type="checkbox" name="segunda_inscricao_rep" checked={!!data.segunda_inscricao_rep} onChange={handleChange} className="w-4 h-4 accent-brand-400" />
              2a inscrição do Representante
            </label>
            <label className="flex items-center gap-3 cursor-pointer text-brand-200 text-sm">
              <input type="checkbox" name="segunda_inscricao_parc" checked={!!data.segunda_inscricao_parc} onChange={handleChange} className="w-4 h-4 accent-brand-400" />
              2a inscrição do Parceiro
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-200 mb-1">Observação</label>
            <textarea
              name="observacao"
              value={data.observacao}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 bg-surface-light border border-surface-border rounded-lg text-white placeholder-brand-300/40 focus:outline-none focus:ring-2 focus:ring-brand-400/40 resize-y"
              placeholder="Anotações sobre esta inscrição..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-surface-border">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} isLoading={saving}>➕ Criar Inscrição</Button>
        </div>
      </div>
    </div>
  );
}
