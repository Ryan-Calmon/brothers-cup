import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';
import * as XLSX from 'xlsx';
import VagasPorCategoria from './VagasPorCategoria';

function AdminPage() {
  const [inscricoes, setInscricoes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [mostrarApenasPagos, setMostrarApenasPagos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // --- NOVOS ESTADOS PARA UNIFORME PERSONALIZADO ---
  const [uniformeRepresentantePersonalizado, setUniformeRepresentantePersonalizado] = useState('');
  const [uniformeParceiroPersonalizado, setUniformeParceiroPersonalizado] = useState('');
  // -------------------------------------------------

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      console.error('Erro ao parsear dados do usuário:', err);
      navigate('/login');
      return;
    }

    verifyToken(token);
    fetchInscricoes();
    fetchServerStatus();
  }, [navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/verify-token`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Token inválido');
    } catch (err) {
      console.error('Token inválido:', err);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleAuthError = (response) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/login');
      return true;
    }
    return false;
  };

  const fetchServerStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/status`);
      if (response.ok) {
        const data = await response.json();
        setServerStatus(data);
      } else {
        setServerStatus({ status: 'offline', message: 'Servidor não respondeu', timestamp: new Date().toISOString() });
      }
    } catch (err) {
      console.error('Erro ao buscar status do servidor:', err);
      setServerStatus({ status: 'offline', message: 'Erro de conexão', timestamp: new Date().toISOString() });
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchInscricoes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/inscricoes`, { headers: getAuthHeaders() });
      if (!response.ok) {
        if (handleAuthError(response)) return;
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setInscricoes(data);
    } catch (err) {
      console.error('Erro ao buscar inscrições:', err);
      setError('Erro ao carregar inscrições. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta inscrição? Esta ação não pode ser desfeita.')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/inscricao/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!response.ok) {
        if (handleAuthError(response)) return;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao excluir inscrição');
      }
      alert('Inscrição excluída com sucesso!');
      setInscricoes(inscricoes.filter(item => item.id !== id));
    } catch (err) {
      console.error('Erro ao excluir inscrição:', err);
      alert(`Erro ao excluir inscrição: ${err.message}`);
    }
  };

  // --- FUNÇÃO handleEdit MODIFICADA ---
  const handleEdit = (inscricao) => {
    const tamanhosPadrao = ["", "PP Masculino", "P Masculino", "M Masculino", "G Masculino", "GG Masculino", "XG Masculino", "PP Feminino", "P Feminino", "M Feminino", "G Feminino", "GG Feminino", "XG Feminino"];
    const editingData = { ...inscricao };

    // Lógica para uniforme do representante
    if (inscricao.uniforme_representante && !tamanhosPadrao.includes(inscricao.uniforme_representante)) {
        editingData.uniforme_representante = 'Personalizado';
        setUniformeRepresentantePersonalizado(inscricao.uniforme_representante);
    } else {
        setUniformeRepresentantePersonalizado('');
    }

    // Lógica para uniforme do parceiro
    if (inscricao.uniforme_parceiro && !tamanhosPadrao.includes(inscricao.uniforme_parceiro)) {
        editingData.uniforme_parceiro = 'Personalizado';
        setUniformeParceiroPersonalizado(inscricao.uniforme_parceiro);
    } else {
        setUniformeParceiroPersonalizado('');
    }
    
    setEditing(editingData);
  };

  // --- FUNÇÃO handleSave MODIFICADA ---
  const handleSave = async () => {
    if (!editing) return;

    if (!editing.representante || !editing.parceiro || !editing.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Prepara os dados para envio, tratando os uniformes personalizados
    const dadosParaSalvar = { ...editing };
    if (dadosParaSalvar.uniforme_representante === 'Personalizado') {
        dadosParaSalvar.uniforme_representante = uniformeRepresentantePersonalizado;
    }
    if (dadosParaSalvar.uniforme_parceiro === 'Personalizado') {
        dadosParaSalvar.uniforme_parceiro = uniformeParceiroPersonalizado;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/inscricao/${editing.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dadosParaSalvar) // Envia os dados corretos
      });

      if (!response.ok) {
        if (handleAuthError(response)) return;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar inscrição');
      }

      alert('Inscrição atualizada com sucesso!');
      handleCloseEdit(); // Fecha o modal e limpa os estados
      fetchInscricoes(); // Recarrega os dados
    } catch (err) {
      console.error('Erro ao editar inscrição:', err);
      alert(`Erro ao atualizar inscrição: ${err.message}`);
    }
  };

  // --- FUNÇÃO handleChange MODIFICADA ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Limpa o campo de texto personalizado se o usuário mudar para um tamanho padrão
    if (name === 'uniforme_representante' && value !== 'Personalizado') {
        setUniformeRepresentantePersonalizado('');
    }
    if (name === 'uniforme_parceiro' && value !== 'Personalizado') {
        setUniformeParceiroPersonalizado('');
    }

    setEditing(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCloseEdit = () => {
    setEditing(null);
    // Limpa os estados de uniforme personalizado ao fechar
    setUniformeRepresentantePersonalizado('');
    setUniformeParceiroPersonalizado('');
  };

  const filteredInscricoes = inscricoes
    .filter(inscricao =>
      (inscricao.representante || '').toLowerCase().includes(search.toLowerCase()) ||
      (inscricao.parceiro || '').toLowerCase().includes(search.toLowerCase()) ||
      (inscricao.categoria || '').toLowerCase().includes(search.toLowerCase()) ||
      inscricao.id?.toString().includes(search)
    )
    .filter(inscricao => !mostrarApenasPagos || inscricao.status_pagamento === 'approved');

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/login');
    }
  };

  const handleRefresh = () => fetchInscricoes();
  const handleRefreshStatus = () => fetchServerStatus();

  const exportarTodosExcel = () => {
    const dados = inscricoes.map(i => ({
      ID: i.id,
      Representante: i.representante,
      Parceiro: i.parceiro,
      Categoria: i.categoria,
      Celular: i.celular,
      'Instagram Representante': i.instagram_representante,
      'Instagram Parceiro': i.instagram_parceiro,
      'CT Representante': i.ct_representante,
      'CT Parceiro': i.ct_parceiro,
      'Tamanho Representante': i.uniforme_representante,
      'Tamanho Parceiro': i.uniforme_parceiro, 
      'Segunda Inscrição': i.segunda_inscricao ? 'Sim' : 'Não', // Exporta o novo campo
      'Data Inscrição': new Date(i.data_inscricao).toLocaleDateString('pt-BR'), 
      'Status Pagamento': i.status_pagamento
    }));
    
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Todas as Inscrições'); 
    XLSX.writeFile(wb, `inscricoes_todas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarExcel = () => {
    const pagos = inscricoes.filter(i => i.status_pagamento === 'approved');
    const dados = pagos.map(i => ({
      ID: i.id,
      Representante: i.representante,
      Parceiro: i.parceiro,
      Categoria: i.categoria,
      Celular: i.celular,
      'Instagram Representante': i.instagram_representante,
      'Instagram Parceiro': i.instagram_parceiro,
      'CT Representante': i.ct_representante,
      'CT Parceiro': i.ct_parceiro,
      'Tamanho Representante': i.uniforme_representante,
      'Tamanho Parceiro': i.uniforme_parceiro,
      'Segunda Inscrição': i.segunda_inscricao ? 'Sim' : 'Não', // Exporta o novo campo
      'Data Inscrição': i.data_inscricao,
      'Status Pagamento': i.status_pagamento
    }));
    
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscrições Pagas');
    XLSX.writeFile(wb, `inscricoes_pagas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'metade_pago': return '💰';
      case 'pendente': return '⏳';
      case 'rejeitado': return '❌';
      case 'campeao': return '🏆'
      default: return '❓';
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60); // Usar Math.floor para evitar casas decimais

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando inscrições...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-left">
          <h1 className="admin-title">🏆 Administração - Brothers Cup</h1>
          <p className="admin-subtitle">
            Bem-vindo, <strong>{user?.username}</strong> | 
            Total de inscrições: <strong>{inscricoes.length}</strong> | 
            Pagas: <strong>{inscricoes.filter(i => i.status_pagamento === 'approved').length}</strong> | 
            Metade Pago: <strong>{inscricoes.filter(i => i.status_pagamento === 'metade_pago').length}</strong>
          </p>
        </div>
        <div className="header-right">
          <button className="logout-button" onClick={handleLogout}>🚪 Sair</button>
        </div>
      </div>

      <div className="server-status-section">
        <div className="server-status-header">
          <h2 className="status-title">🖥️ Status do Servidor</h2>
          <button className="refresh-status-button" onClick={handleRefreshStatus} disabled={statusLoading}>
            {statusLoading ? '⏳' : '🔄'} Atualizar Status
          </button>
        </div>
        {serverStatus && (
          <div className={`server-status-card ${serverStatus.status}`}>
            <div className="status-main">
              <div className="status-indicator">
                <span className={`status-dot ${serverStatus.status}`}></span>
                <strong className="status-text">{serverStatus.status === 'online' ? '🟢 Online' : '🔴 Offline'}</strong>
              </div>
              <div className="status-timestamp">Última verificação: {new Date(serverStatus.timestamp).toLocaleString('pt-BR')}</div>
            </div>
            {serverStatus.status === 'online' && (
              <div className="status-details">
                <div className="status-item"><span className="status-label">Uptime:</span><span className="status-value">{formatUptime(serverStatus.uptime)}</span></div>
                <div className="status-item"><span className="status-label">Banco de Dados:</span><span className={`status-value ${serverStatus.database?.status}`}>{serverStatus.database?.status === 'online' ? '🟢 Online' : '🔴 Offline'}{serverStatus.database?.latency && ` (${serverStatus.database.latency})`}</span></div>
                <div className="status-item"><span className="status-label">Ambiente:</span><span className="status-value">{serverStatus.server?.environment || 'N/A'}</span></div>
              </div>
            )}
            {serverStatus.status === 'offline' && (<div className="status-error"><span className="error-message">⚠️ {serverStatus.message || 'Servidor indisponível'}</span></div>)}
          </div>
        )}
      </div>

      {error && (<div className="error-banner"><span>⚠️ {error}</span><button onClick={() => setError('')}>✕</button></div>)}

      <div className="admin-controls">
        <div className="search-container"><input type="text" className="search-input" placeholder="🔍 Pesquisar por Representante, Parceiro, Categoria ou ID" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="action-buttons">
          <button className="refresh-button" onClick={handleRefresh}>🔄 Atualizar</button>
          <button className={`filter-button ${mostrarApenasPagos ? 'active' : ''}`} onClick={() => setMostrarApenasPagos(prev => !prev)}>{mostrarApenasPagos ? '👥 Mostrar Todos' : '💰 Apenas Pagos'}</button>
          <button className="export-button" onClick={exportarExcel}>📊 Exportar Pagos</button>
          <button className="export-all-button" onClick={exportarTodosExcel}>📋 Exportar Todos</button>
          <VagasPorCategoria inscricoes={inscricoes} />
        </div>
      </div>

      <div className="inscricoes-container">
        {filteredInscricoes.length === 0 ? (
          <div className="no-data"><p>📭 Nenhuma inscrição encontrada</p>{search && (<button onClick={() => setSearch('')} className="clear-search">Limpar pesquisa</button>)}</div>
        ) : (
          <div className="table-container">
            <table className="inscricoes-table">
              <thead><tr><th>ID</th><th>Representante</th><th>Celular</th><th>Parceiro</th><th>Instagram Rep.</th><th>Instagram Parc.</th><th>CT Rep.</th><th>CT Parc.</th><th>Tam Rep.</th><th>Tam Parc.</th><th>Categoria</th><th>Data</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {filteredInscricoes.map(inscricao => (
                  <tr key={inscricao.id} className={inscricao.status_pagamento === 'approved' ? 'pago' : inscricao.status_pagamento === 'metade_pago' ? 'metade-pago' : inscricao.status_pagamento === 'campeao' ? 'campeao' : ''}>
                    <td className="id-cell">{inscricao.id}</td>
                    {/* --- ÍCONE DE SEGUNDA INSCRIÇÃO ADICIONADO AQUI --- */}
                    <td className="name-cell">{inscricao.representante} {inscricao.segunda_inscricao && <span title="Segunda Inscrição">✌️</span>}</td>
                    <td className="phone-cell">{inscricao.celular}</td>
                    <td className="name-cell">{inscricao.parceiro}</td>
                    <td className="instagram-cell">@{inscricao.instagram_representante}</td>
                    <td className="instagram-cell">@{inscricao.instagram_parceiro}</td>
                    <td className="ct-cell">{inscricao.ct_representante || '-'}</td>
                    <td className="ct-cell">{inscricao.ct_parceiro || '-'}</td>
                    <td className="tam-cell">{inscricao.uniforme_representante}</td>
                    <td className="tam-cell">{inscricao.uniforme_parceiro}</td>
                    <td className="category-cell">{inscricao.categoria}</td>
                    <td className="date-cell">{new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')}</td>
                    <td className="status-cell"><span className={`status-badge ${inscricao.status_pagamento}`}>{getStatusIcon(inscricao.status_pagamento)} {inscricao.status_pagamento === 'campeao' ? 'Campeão' : inscricao.status_pagamento} </span></td>
                    <td className="actions-cell">
                      <button className="edit-button" onClick={() => handleEdit(inscricao)} title="Editar inscrição">✏️</button>
                      <button className="delete-button" onClick={() => handleDelete(inscricao.id)} title="Excluir inscrição">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL DE EDIÇÃO MODIFICADO --- */}
      {editing && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header"><h2>✏️ Editar Inscrição #{editing.id}</h2><button className="close-button" onClick={handleCloseEdit}>✕</button></div>
            <div className="modal-content">
              <div className="form-row"><div className="form-group"><label htmlFor="representante">Nome do Representante *</label><input type="text" id="representante" name="representante" value={editing.representante || ''} onChange={handleChange} required /></div><div className="form-group"><label htmlFor="parceiro">Nome do Parceiro *</label><input type="text" id="parceiro" name="parceiro" value={editing.parceiro || ''} onChange={handleChange} required /></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="celular">Celular</label><input type="text" id="celular" name="celular" value={editing.celular || ''} onChange={handleChange} /></div><div className="form-group"><label htmlFor="categoria">Categoria *</label><select id="categoria" name="categoria" value={editing.categoria || ''} onChange={handleChange} required><option value="">Selecione a categoria</option><option value="Feminino Escolinha">Feminino Escolinha</option><option value="Masculino Escolinha">Masculino Escolinha</option><option value="Feminino Iniciante">Feminino Iniciante</option><option value="Misto Escolinha">Misto Escolinha</option><option value="Misto Iniciante">Misto Iniciante</option><option value="Misto Intermediário">Misto Intermediário</option><option value="Masculino Iniciante">Masculino Iniciante</option><option value="Masculino Intermediário">Masculino Intermediário</option></select></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="instagramRepresentante">Instagram Representante</label><input type="text" id="instagramRepresentante" name="instagram_representante" value={editing.instagram_representante || ''} onChange={handleChange} placeholder="sem @" /></div><div className="form-group"><label htmlFor="instagramParceiro">Instagram Parceiro</label><input type="text" id="instagramParceiro" name="instagram_parceiro" value={editing.instagram_parceiro || ''} onChange={handleChange} placeholder="sem @" /></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="ctRepresentante">CT do Representante</label><input type="text" id="ctRepresentante" name="ct_representante" value={editing.ct_representante || ''} onChange={handleChange} /></div><div className="form-group"><label htmlFor="ctParceiro">CT do Parceiro</label><input type="text" id="ctParceiro" name="ct_parceiro" value={editing.ct_parceiro || ''} onChange={handleChange} /></div></div>
              
              {/* --- CAMPO DE UNIFORME DO REPRESENTANTE MODIFICADO --- */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="uniformeRepresentante">Uniforme Representante</label>
                  <select id="uniformeRepresentante" name="uniforme_representante" value={editing.uniforme_representante || ''} onChange={handleChange}>
                    <option value="">Selecione o tamanho</option><option value="PP Masculino">PP Masculino</option><option value="P Masculino">P Masculino</option><option value="M Masculino">M Masculino</option><option value="G Masculino">G Masculino</option><option value="GG Masculino">GG Masculino</option><option value="XG Masculino">XG Masculino</option><option value="PP Feminino">PP Feminino</option><option value="P Feminino">P Feminino</option><option value="M Feminino">M Feminino</option><option value="G Feminino">G Feminino</option><option value="GG Feminino">GG Feminino</option><option value="XG Feminino">XG Feminino</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                  {editing.uniforme_representante === 'Personalizado' && (
                    <input type="text" className="input-personalizado" placeholder="Digite o tamanho personalizado" value={uniformeRepresentantePersonalizado} onChange={(e) => setUniformeRepresentantePersonalizado(e.target.value)} style={{ marginTop: '10px' }} />
                  )}
                </div>
                {/* --- CAMPO DE UNIFORME DO PARCEIRO MODIFICADO --- */}
                <div className="form-group">
                  <label htmlFor="uniformeParceiro">Uniforme Parceiro</label>
                  <select id="uniformeParceiro" name="uniforme_parceiro" value={editing.uniforme_parceiro || ''} onChange={handleChange}>
                    <option value="">Selecione o tamanho</option><option value="PP Masculino">PP Masculino</option><option value="P Masculino">P Masculino</option><option value="M Masculino">M Masculino</option><option value="G Masculino">G Masculino</option><option value="GG Masculino">GG Masculino</option><option value="XG Masculino">XG Masculino</option><option value="PP Feminino">PP Feminino</option><option value="P Feminino">P Feminino</option><option value="M Feminino">M Feminino</option><option value="G Feminino">G Feminino</option><option value="GG Feminino">GG Feminino</option><option value="XG Feminino">XG Feminino</option>
                    <option value="Personalizado">Personalizado</option>
                  </select>
                  {editing.uniforme_parceiro === 'Personalizado' && (
                    <input type="text" className="input-personalizado" placeholder="Digite o tamanho personalizado" value={uniformeParceiroPersonalizado} onChange={(e) => setUniformeParceiroPersonalizado(e.target.value)} style={{ marginTop: '10px' }} />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statusPagamento">Status do Pagamento</label>
                  <select id="statusPagamento" name="status_pagamento" value={editing.status_pagamento || 'pendente'} onChange={handleChange}>
                    <option value="pendente">Pendente</option><option value="approved">Aprovado</option><option value="metade_pago">Metade Pago</option><option value="rejeitado">Rejeitado</option><option value="campeao">🏆 Campeão (Isento)</option>
                  </select>
                </div>
                {/* --- CHECKBOX DE SEGUNDA INSCRIÇÃO ADICIONADA --- */}
                <div className="form-group" style={{ alignItems: 'center', display: 'flex', marginTop: '20px' }}>
                  <label htmlFor="segundaInscricao" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" id="segundaInscricao" name="segunda_inscricao" checked={!!editing.segunda_inscricao} onChange={handleChange} style={{ marginRight: '10px', width: 'auto' }} />
                    É uma segunda inscrição da dupla?
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer"><button className="cancel-button" onClick={handleCloseEdit}>Cancelar</button><button className="save-button" onClick={handleSave}>💾 Salvar Alterações</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
