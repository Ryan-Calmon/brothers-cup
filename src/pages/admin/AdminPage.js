import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchInscricoes as fetchInscricoesApi,
  updateInscricao,
  deleteInscricao,
  getServerStatus,
  criarInscricaoAdmin,
} from "../../services/api";
import { PageLoader, Button, Badge, Card } from "../../Components/ui";
import * as XLSX from "xlsx";
import EditModal from "./EditModal";
import CreateModal from "./CreateModal";
import ServerStatusCard from "./ServerStatusCard";
import VagasModal from "./VagasModal";

export default function AdminPage() {
  const [inscricoes, setInscricoes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [mostrarApenasPagos, setMostrarApenasPagos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [serverStatus, setServerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [vagasOpen, setVagasOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const fetchInscricoes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInscricoesApi();
      setInscricoes(data);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        handleLogout();
        navigate("/login");
        return;
      }
      setError("Erro ao carregar inscrições.");
    } finally {
      setLoading(false);
    }
  }, [handleLogout, navigate]);

  const fetchStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const data = await getServerStatus();
      setServerStatus(data);
    } catch {
      setServerStatus({
        status: "offline",
        message: "Erro de conexão",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInscricoes();
    fetchStatus();
  }, [fetchInscricoes, fetchStatus]);

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir esta inscrição? Esta ação não pode ser desfeita."))
      return;
    try {
      await deleteInscricao(id);
      setInscricoes((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleSave = async (data) => {
    try {
      await updateInscricao(data.id, data);
      setEditing(null);
      fetchInscricoes();
    } catch (err) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleCreate = async (data) => {
    await criarInscricaoAdmin(data);
    setCreating(false);
    fetchInscricoes();
  };

  const filteredInscricoes = inscricoes
    .filter((i) => {
      const q = search.toLowerCase();
      return (
        (i.representante || "").toLowerCase().includes(q) ||
        (i.parceiro || "").toLowerCase().includes(q) ||
        (i.categoria || "").toLowerCase().includes(q) ||
        i.id?.toString().includes(q)
      );
    })
    .filter((i) => !mostrarApenasPagos || i.status_pagamento === "approved");

  const totalPagas = inscricoes.filter(
    (i) => i.status_pagamento === "approved"
  ).length;

  const exportExcel = (onlyPaid = false) => {
    const source = onlyPaid
      ? inscricoes.filter((i) => i.status_pagamento === "approved")
      : inscricoes;

    const rows = source.map((i) => ({
      ID: i.id,
      Representante: i.representante,
      Parceiro: i.parceiro,
      Categoria: i.categoria,
      Celular: i.celular,
      "Instagram Rep.": i.instagram_representante,
      "Instagram Parc.": i.instagram_parceiro,
      "CT Rep.": i.ct_representante,
      "CT Parc.": i.ct_parceiro,
      "Uniforme Rep.": i.uniforme_representante,
      "Uniforme Parc.": i.uniforme_parceiro,
      "2a Insc. Rep": i.segunda_inscricao_rep ? "Sim" : "Não",
      "2a Insc. Parc": i.segunda_inscricao_parc ? "Sim" : "Não",
      Observação: i.observacao || "",
      Data: new Date(i.data_inscricao).toLocaleDateString("pt-BR"),
      Status: i.status_pagamento,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, onlyPaid ? "Pagos" : "Todas");
    XLSX.writeFile(
      wb,
      `inscricoes_${onlyPaid ? "pagas" : "todas"}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const getStatusBadge = (status) => {
    const map = {
      approved: { variant: "success", icon: "✅", label: "Aprovado" },
      metade_pago: { variant: "warning", icon: "💰", label: "Metade Pago" },
      pending: { variant: "info", icon: "⏳", label: "Pendente" },
      pendente: { variant: "info", icon: "⏳", label: "Pendente" },
      rejected: { variant: "danger", icon: "❌", label: "Rejeitado" },
      rejeitado: { variant: "danger", icon: "❌", label: "Rejeitado" },
      campeao: { variant: "champion", icon: "🏆", label: "Campeão" },
    };
    const s = map[status] || { variant: "default", icon: "❓", label: status };
    return (
      <Badge variant={s.variant}>
        {s.icon} {s.label}
      </Badge>
    );
  };

  const doLogout = () => {
    if (window.confirm("Sair do painel?")) {
      handleLogout();
      navigate("/login");
    }
  };

  if (loading) return <PageLoader message="Carregando inscrições..." />;

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            🏆 Brothers Cup — Admin
          </h1>
          <p className="text-brand-200/60 text-sm mt-1">
            Olá, <span className="text-brand-300 font-semibold">{user?.username}</span>{" "}
            | Total: <strong className="text-white">{inscricoes.length}</strong>{" "}
            | Pagas: <strong className="text-green-400">{totalPagas}</strong>
          </p>
        </div>
        <Button variant="danger" size="sm" onClick={doLogout}>
          🚪 Sair
        </Button>
      </div>

      {/* Server Status */}
      <ServerStatusCard
        status={serverStatus}
        isLoading={statusLoading}
        onRefresh={fetchStatus}
      />

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 mb-4 flex justify-between items-center">
          <span className="text-red-400 text-sm">⚠️ {error}</span>
          <button
            className="text-red-400 hover:text-red-300"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          className="flex-1 px-4 py-2 bg-surface-light border border-surface-border rounded-lg text-white placeholder-brand-300/40 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
          placeholder="🔍 Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={fetchInscricoes}>
            🔄 Atualizar
          </Button>
          <Button
            variant={mostrarApenasPagos ? "primary" : "secondary"}
            size="sm"
            onClick={() => setMostrarApenasPagos((p) => !p)}
          >
            {mostrarApenasPagos ? "👥 Todos" : "💰 Pagos"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportExcel(true)}
          >
            📊 Export Pagos
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportExcel(false)}
          >
            📋 Export Todos
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setVagasOpen(true)}
          >
            📊 Vagas
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreating(true)}
          >
            ➕ Nova Inscrição
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredInscricoes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-brand-200/50">📭 Nenhuma inscrição encontrada</p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-brand-400 hover:text-brand-300 text-sm mt-2"
            >
              Limpar pesquisa
            </button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-800/30 text-brand-200 text-left">
                  <th className="px-3 py-3 font-semibold">ID</th>
                  <th className="px-3 py-3 font-semibold">Representante</th>
                  <th className="px-3 py-3 font-semibold">Celular</th>
                  <th className="px-3 py-3 font-semibold">Parceiro</th>
                  <th className="px-3 py-3 font-semibold">@ Rep.</th>
                  <th className="px-3 py-3 font-semibold">@ Parc.</th>
                  <th className="px-3 py-3 font-semibold">Tam. Rep.</th>
                  <th className="px-3 py-3 font-semibold">Tam. Parc.</th>
                  <th className="px-3 py-3 font-semibold">Categoria</th>
                  <th className="px-3 py-3 font-semibold">Data</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Obs.</th>
                  <th className="px-3 py-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredInscricoes.map((i) => (
                  <tr
                    key={i.id}
                    className={`hover:bg-brand-800/10 transition-colors ${
                      i.status_pagamento === "approved"
                        ? "bg-green-900/10"
                        : i.status_pagamento === "campeao"
                        ? "bg-amber-900/10"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2 text-brand-300">{i.id}</td>
                    <td className="px-3 py-2 text-white font-medium">
                      {i.representante}
                      {i.segunda_inscricao_rep && (
                        <span title="2a Inscrição"> ✌️</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-brand-200">{i.celular}</td>
                    <td className="px-3 py-2 text-white">
                      {i.parceiro}
                      {i.segunda_inscricao_parc && (
                        <span title="2a Inscrição"> ✌️</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-brand-200/70 text-xs">
                      @{i.instagram_representante}
                    </td>
                    <td className="px-3 py-2 text-brand-200/70 text-xs">
                      @{i.instagram_parceiro}
                    </td>
                    <td className="px-3 py-2 text-brand-200/70 text-xs">
                      {i.uniforme_representante}
                    </td>
                    <td className="px-3 py-2 text-brand-200/70 text-xs">
                      {i.uniforme_parceiro}
                    </td>
                    <td className="px-3 py-2">
                      <Badge>{i.categoria}</Badge>
                    </td>
                    <td className="px-3 py-2 text-brand-200/70 text-xs whitespace-nowrap">
                      {new Date(i.data_inscricao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-3 py-2">
                      {getStatusBadge(i.status_pagamento)}
                    </td>
                    <td className="px-3 py-2 text-brand-200/70 text-xs max-w-[150px] truncate" title={i.observacao || ""}>
                      {i.observacao || "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 hover:bg-brand-800/50 rounded transition-colors"
                          onClick={() => setEditing({ ...i })}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-900/50 rounded transition-colors"
                          onClick={() => handleDelete(i.id)}
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      {editing && (
        <EditModal
          inscricao={editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Vagas Modal */}
      {vagasOpen && (
        <VagasModal
          inscricoes={inscricoes}
          onClose={() => setVagasOpen(false)}
        />
      )}

      {/* Create Modal */}
      {creating && (
        <CreateModal
          onCreate={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
