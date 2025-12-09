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
  
  const [uniformeRepresentantePersonalizado, setUniformeRepresentantePersonalizado] = useState('');
  const [uniformeParceiroPersonalizado, setUniformeParceiroPersonalizado] = useState('');

  // NOVO ESTADO: Para o modal de Adicionar Inscrição
  const [adding, setAdding] = useState(false);
  const [novaInscricao, setNovaInscricao] = useState({
    representante: '',
    parceiro: '',
    instagram_representante: '',
    instagram_parceiro: '',
    uniforme_representante: '',
    uniforme_parceiro: '',
    categoria: '',
    ct_representante: '',
    ct_parceiro: '',
    celular: '',
    status_pagamento: 'pendente',
    valor_inscricao: 0,
    forma_pagamento: 'admin',
    desconto: 0, // NOVO CAMPO
    observacao: '', // NOVO CAMPO
    outro_valor_pago: 0, // NOVO CAMPO
    id_integrante_1: '', // NOVO CAMPO
    id_integrante_2: '', // NOVO CAMPO
  });
  const [uniformeNovaRepPersonalizado, setUniformeNovaRepPersonalizado] = useState('');
  const [uniformeNovaParcPersonalizado, setUniformeNovaParcPersonalizado] = useState('');
  const [integrante1Data, setIntegrante1Data] = useState(null); // Dados do integrante 1
  const [integrante2Data, setIntegrante2Data] = useState(null); // Dados do integrante 2

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

  const handleEdit = (inscricao) => {
    const tamanhosPadrao = ["", "PP Masculino", "P Masculino", "M Masculino", "G Masculino", "GG Masculino", "XG Masculino", "PP Feminino", "P Feminino", "M Feminino", "G Feminino", "GG Feminino", "XG Feminino", "Segunda Inscrição"];
    const editingData = { ...inscricao };

    // Tratar campos numéricos que podem vir como string
    editingData.desconto = parseFloat(editingData.desconto || 0);
    editingData.outro_valor_pago = parseFloat(editingData.outro_valor_pago || 0);
    editingData.valor_inscricao = parseFloat(editingData.valor_inscricao || 0);

    if (inscricao.uniforme_representante && !tamanhosPadrao.includes(inscricao.uniforme_representante)) {
        editingData.uniforme_representante = 'Personalizado';
        setUniformeRepresentantePersonalizado(inscricao.uniforme_representante);
    } else {
        setUniformeRepresentantePersonalizado('');
    }

    if (inscricao.uniforme_parceiro && !tamanhosPadrao.includes(inscricao.uniforme_parceiro)) {
        editingData.uniforme_parceiro = 'Personalizado';
        setUniformeParceiroPersonalizado(inscricao.uniforme_parceiro);
    } else {
        setUniformeParceiroPersonalizado('');
    }
    
    setEditing(editingData);
  };

  const handleSave = async () => {
    if (!editing) return;

    if (!editing.representante || !editing.parceiro || !editing.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const dadosParaSalvar = { ...editing };
    if (dadosParaSalvar.uniforme_representante === 'Personalizado') {
        dadosParaSalvar.uniforme_representante = uniformeRepresentantePersonalizado;
    }
    if (dadosParaSalvar.uniforme_parceiro === 'Personalizado') {
        dadosParaSalvar.uniforme_parceiro = uniformeParceiroPersonalizado;
    }

    // Garantir que os campos numéricos sejam números
    dadosParaSalvar.desconto = parseFloat(dadosParaSalvar.desconto || 0);
    dadosParaSalvar.outro_valor_pago = parseFloat(dadosParaSalvar.outro_valor_pago || 0);
    dadosParaSalvar.valor_inscricao = parseFloat(dadosParaSalvar.valor_inscricao || 260); // Valor padrão 260

    try {
      const response = await fetch(`${BACKEND_URL}/inscricao/${editing.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(dadosParaSalvar)
      });

      if (!response.ok) {
        if (handleAuthError(response)) return;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar inscrição');
      }

      alert('Inscrição atualizada com sucesso!');
      handleCloseEdit();
      fetchInscricoes();
    } catch (err) {
      console.error('Erro ao editar inscrição:', err);
      alert(`Erro ao atualizar inscrição: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === 'number') {
      newValue = parseFloat(value) || 0;
    }

    const newState = { ...editing, [name]: type === 'checkbox' ? checked : newValue };

    if (name === 'segunda_inscricao_rep') {
      if (checked) {
        newState.uniforme_representante = 'Segunda Inscrição';
        setUniformeRepresentantePersonalizado('');
      } else {
        newState.uniforme_representante = '';
      }
    }

    if (name === 'segunda_inscricao_parc') {
      if (checked) {
        newState.uniforme_parceiro = 'Segunda Inscrição';
        setUniformeParceiroPersonalizado('');
      } else {
        newState.uniforme_parceiro = '';
      }
    }

    if (name === 'uniforme_representante' && value !== 'Personalizado') {
      setUniformeRepresentantePersonalizado('');
    }
    if (name === 'uniforme_parceiro' && value !== 'Personalizado') {
      setUniformeParceiroPersonalizado('');
    }

    setEditing(newState);
  };

  const handleCloseEdit = () => {
    setEditing(null);
    setUniformeRepresentantePersonalizado('');
    setUniformeParceiroPersonalizado('');
  };

  // Lógica para o novo modal de Adicionar Inscrição
  const handleOpenAdd = () => {
    setAdding(true);
    setNovaInscricao({
      representante: '',
      parceiro: '',
      instagram_representante: '',
      instagram_parceiro: '',
      uniforme_representante: '',
      uniforme_parceiro: '',
      categoria: '',
      ct_representante: '',
      ct_parceiro: '',
      celular: '',
      status_pagamento: 'pendente',
      valor_inscricao: 0,
      forma_pagamento: 'admin',
      desconto: 0,
      observacao: '',
      outro_valor_pago: 0,
      id_integrante_1: '',
      id_integrante_2: '',
    });
    setIntegrante1Data(null);
    setIntegrante2Data(null);
    setUniformeNovaRepPersonalizado('');
    setUniformeNovaParcPersonalizado('');
  };

  const handleCloseAdd = () => {
    setAdding(false);
  };

  const handleNovaInscricaoChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === 'number') {
      newValue = parseFloat(value) || 0;
    }

    setNovaInscricao(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : newValue
    }));

    if (name === 'uniforme_representante' && value !== 'Personalizado') {
      setUniformeNovaRepPersonalizado('');
    }
    if (name === 'uniforme_parceiro' && value !== 'Personalizado') {
      setUniformeNovaParcPersonalizado('');
    }
  };

  const handleAddInscricao = async () => {
    if (!novaInscricao.representante || !novaInscricao.parceiro || !novaInscricao.categoria || !novaInscricao.status_pagamento) {
      alert('Por favor, preencha os campos obrigatórios: Representante, Parceiro, Categoria e Status de Pagamento.');
      return;
    }

    const dadosParaSalvar = { ...novaInscricao };

    if (dadosParaSalvar.uniforme_representante === 'Personalizado') {
        dadosParaSalvar.uniforme_representante = uniformeNovaRepPersonalizado;
    }
    if (dadosParaSalvar.uniforme_parceiro === 'Personalizado') {
        dadosParaSalvar.uniforme_parceiro = uniformeNovaParcPersonalizado;
    }

    // Garantir que os campos numéricos sejam números
    dadosParaSalvar.desconto = parseFloat(dadosParaSalvar.desconto || 0);
    dadosParaSalvar.outro_valor_pago = parseFloat(dadosParaSalvar.outro_valor_pago || 0);
    dadosParaSalvar.valor_inscricao = parseFloat(dadosParaSalvar.valor_inscricao || 260); // Valor padrão 260

    try {
      const response = await fetch(`${BACKEND_URL}/inscricao/admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dadosParaSalvar)
      });

      if (!response.ok) {
        if (handleAuthError(response)) return;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar inscrição');
      }

      alert('Inscrição adicionada com sucesso!');
      handleCloseAdd();
      fetchInscricoes();
    } catch (err) {
      console.error('Erro ao adicionar inscrição:', err);
      alert(`Erro ao adicionar inscrição: ${err.message}`);
    }
  };

  const fetchIntegranteData = async (id, setIntegranteData) => {
    if (!id) {
      setIntegranteData(null);
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/integrante/${id}`, { headers: getAuthHeaders() });
      if (!response.ok) {
        if (handleAuthError(response)) return;
        setIntegranteData({ error: `ID ${id} não encontrado.` });
        return;
      }
      const data = await response.json();
      setIntegranteData(data);
    } catch (err) {
      console.error(`Erro ao buscar integrante ${id}:`, err);
      setIntegranteData({ error: `Erro ao buscar ID ${id}.` });
    }
  };

  const handleBlurIntegrante1 = () => {
    fetchIntegranteData(novaInscricao.id_integrante_1, setIntegrante1Data);
  };

  const handleBlurIntegrante2 = () => {
    fetchIntegranteData(novaInscricao.id_integrante_2, setIntegrante2Data);
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
      ID: i.id, Representante: i.representante, Parceiro: i.parceiro, Categoria: i.categoria, Celular: i.celular,
      'Instagram Representante': i.instagram_representante, 'Instagram Parceiro': i.instagram_parceiro,
      'CT Representante': i.ct_representante, 'CT Parceiro': i.ct_parceiro,
      'Tamanho Representante': i.uniforme_representante, 'Tamanho Parceiro': i.uniforme_parceiro,
      'Segunda Insc. Rep': i.segunda_inscricao_rep ? 'Sim' : 'Não', 'Segunda Insc. Parc': i.segunda_inscricao_parc ? 'Sim' : 'Não',
      'Valor Inscrição': i.valor_inscricao, 'Desconto': i.desconto, 'Outro Valor Pago': i.outro_valor_pago, 'Valor Final': i.valor_final,
      'Observação': i.observacao,
      'ID Integrante 1': i.id_integrante_1, 'ID Integrante 2': i.id_integrante_2,
      'Data Inscrição': new Date(i.data_inscricao).toLocaleDateString('pt-BR'), 'Status Pagamento': i.status_pagamento
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Todas as Inscrições'); 
    XLSX.writeFile(wb, `inscricoes_todas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportarExcel = () => {
    const pagos = inscricoes.filter(i => i.status_pagamento === 'approved');
    const dados = pagos.map(i => ({
      ID: i.id, Representante: i.representante, Parceiro: i.parceiro, Categoria: i.categoria, Celular: i.celular,
      'Instagram Representante': i.instagram_representante, 'Instagram Parceiro': i.instagram_parceiro,
      'CT Representante': i.ct_representante, 'CT Parceiro': i.ct_parceiro,
      'Tamanho Representante': i.uniforme_representante, 'Tamanho Parceiro': i.uniforme_parceiro,
      'Segunda Insc. Rep': i.segunda_inscricao_rep ? 'Sim' : 'Não', 'Segunda Insc. Parc': i.segunda_inscricao_parc ? 'Sim' : 'Não',
      'Valor Inscrição': i.valor_inscricao, 'Desconto': i.desconto, 'Outro Valor Pago': i.outro_valor_pago, 'Valor Final': i.valor_final,
      'Observação': i.observacao,
      'ID Integrante 1': i.id_integrante_1, 'ID Integrante 2': i.id_integrante_2,
      'Data Inscrição': i.data_inscricao, 'Status Pagamento': i.status_pagamento
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscrições Pagas');
    XLSX.writeFile(wb, `inscricoes_pagas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅'; case 'metade_pago': return '💰'; case 'pendente': return '⏳';
      case 'rejeitado': return '❌'; case 'campeao': return '🏆'; default: return '❓';
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400); const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60); const secs = seconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`; if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`; return `${secs}s`;
  };

  const contagemSegundaInscricaoRep = inscricoes.filter(i => i.segunda_inscricao_rep).length;
  const contagemSegundaInscricaoParc = inscricoes.filter(i => i.segunda_inscricao_parc).length;

  if (loading) {
    return (
      <div className="admin-container"><div className="loading-container"><div className="loading-spinner"></div><p>Carregando inscrições...</p></div></div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-left">
          <h1 className="admin-title">🏆 Administração - Brothers Cup</h1>
          <p className="admin-subtitle">
            Bem-vindo, <strong>{user?.username}</strong> | 
            Total: <strong>{inscricoes.length}</strong> | 
            Pagas: <strong>{inscricoes.filter(i => i.status_pagamento === 'approved').length}</strong> |  
            Segundas Inscrições: <strong>{contagemSegundaInscricaoRep}</strong> (Rep.) + <strong>{contagemSegundaInscricaoParc}</strong> (Parc.) = <strong>{contagemSegundaInscricaoRep + contagemSegundaInscricaoParc}</strong>
          </p>
        </div>
        <div className="header-right">
          <button className="add-button" onClick={handleOpenAdd}>➕ Adicionar Inscrição</button> {/* NOVO BOTÃO */}
          <button className="logout-button" onClick={handleLogout}>🚪 Sair</button>
        </div>
      </div>

      <div className="server-status-section">
        <div className="server-status-header"><h2 className="status-title">🖥️ Status do Servidor</h2><button className="refresh-status-button" onClick={handleRefreshStatus} disabled={statusLoading}>{statusLoading ? '⏳' : '🔄'} Atualizar Status</button></div>
        {serverStatus && (<div className={`server-status-card ${serverStatus.status}`}><div className="status-main"><div className="status-indicator"><span className={`status-dot ${serverStatus.status}`}></span><strong className="status-text">{serverStatus.status === 'online' ? '🟢 Online' : '🔴 Offline'}</strong></div><div className="status-timestamp">Última verificação: {new Date(serverStatus.timestamp).toLocaleString('pt-BR')}</div></div>{serverStatus.status === 'online' && (<div className="status-details"><div className="status-item"><span className="status-label">Uptime:</span><span className="status-value">{formatUptime(serverStatus.uptime)}</span></div><div className="status-item"><span className="status-label">Banco de Dados:</span><span className={`status-value ${serverStatus.database?.status}`}>{serverStatus.database?.status === 'online' ? '🟢 Online' : '🔴 Offline'}{serverStatus.database?.latency && ` (${serverStatus.database.latency})`}</span></div><div className="status-item"><span className="status-label">Ambiente:</span><span className="status-value">{serverStatus.server?.environment || 'N/A'}</span></div></div>)}{serverStatus.status === 'offline' && (<div className="status-error"><span className="error-message">⚠️ {serverStatus.message || 'Servidor indisponível'}</span></div>)}</div>)}
      </div>

      {error && (<div className="error-banner"><span>⚠️ {error}</span><button onClick={() => setError('')}>✕</button></div>)}

      <div className="admin-controls">
        <div className="search-container"><input type="text" className="search-input" placeholder="🔍 Pesquisar por Representante, Parceiro, Categoria ou ID" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="action-buttons"><button className="refresh-button" onClick={handleRefresh}>🔄 Atualizar</button><button className={`filter-button ${mostrarApenasPagos ? 'active' : ''}`} onClick={() => setMostrarApenasPagos(prev => !prev)}>{mostrarApenasPagos ? '👥 Mostrar Todos' : '💰 Apenas Pagos'}</button><button className="export-button" onClick={exportarExcel}>📊 Exportar Pagos</button><button className="export-all-button" onClick={exportarTodosExcel}>📋 Exportar Todos</button><VagasPorCategoria inscricoes={inscricoes} /></div>
      </div>

      <div className="inscricoes-container">
        {filteredInscricoes.length === 0 ? (<div className="no-data"><p>📭 Nenhuma inscrição encontrada</p>{search && (<button onClick={() => setSearch('')} className="clear-search">Limpar pesquisa</button>)}</div>) : (
          <div className="table-container">
            <table className="inscricoes-table">
              <thead><tr><th>ID</th><th>Representante</th><th>Parceiro</th><th>Categoria</th><th>Valor Final</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {filteredInscricoes.map(inscricao => (
                  <tr key={inscricao.id} className={inscricao.status_pagamento === 'approved' ? 'pago' : inscricao.status_pagamento === 'metade_pago' ? 'metade-pago' : inscricao.status_pagamento === 'campeao' ? 'campeao' : ''}>
                    <td className="id-cell">{inscricao.id}</td>
                    <td className="name-cell">{inscricao.representante} {inscricao.segunda_inscricao_rep && <span title="Segunda Inscrição do Representante">✌️</span>}</td>
                    <td className="name-cell">{inscricao.parceiro} {inscricao.segunda_inscricao_parc && <span title="Segunda Inscrição do Parceiro">✌️</span>}</td>
                    <td className="category-cell">{inscricao.categoria}</td>
                    <td className="value-cell">R$ {parseFloat(inscricao.valor_final || inscricao.valor_inscricao).toFixed(2).replace('.', ',')}</td> {/* NOVO CAMPO */}
                    <td className="status-cell"><span className={`status-badge ${inscricao.status_pagamento}`}>{getStatusIcon(inscricao.status_pagamento)} {inscricao.status_pagamento === 'campeao' ? 'Campeão' : inscricao.status_pagamento} </span></td>
                    <td className="actions-cell"><button className="edit-button" onClick={() => handleEdit(inscricao)} title="Editar inscrição">✏️</button><button className="delete-button" onClick={() => handleDelete(inscricao.id)} title="Excluir inscrição">🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edição (Atualizado) */}
      {editing && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header"><h2>✏️ Editar Inscrição #{editing.id}</h2><button className="close-button" onClick={handleCloseEdit}>✕</button></div>
            <div className="modal-content">
              <div className="form-row"><div className="form-group"><label htmlFor="representante">Nome do Representante *</label><input type="text" id="representante" name="representante" value={editing.representante || ''} onChange={handleChange} required /></div><div className="form-group"><label htmlFor="parceiro">Nome do Parceiro *</label><input type="text" id="parceiro" name="parceiro" value={editing.parceiro || ''} onChange={handleChange} required /></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="celular">Celular</label><input type="text" id="celular" name="celular" value={editing.celular || ''} onChange={handleChange} /></div><div className="form-group"><label htmlFor="categoria">Categoria *</label><select id="categoria" name="categoria" value={editing.categoria || ''} onChange={handleChange} required><option value="">Selecione a categoria</option><option value="Feminino Escolinha">Feminino Escolinha</option><option value="Masculino Escolinha">Masculino Escolinha</option><option value="Feminino Iniciante">Feminino Iniciante</option><option value="Misto Escolinha">Misto Escolinha</option><option value="Misto Iniciante">Misto Iniciante</option><option value="Misto Intermediário">Misto Intermediário</option><option value="Masculino Iniciante">Masculino Iniciante</option><option value="Masculino Intermediário">Masculino Intermediário</option></select></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="instagramRepresentante">Instagram Representante</label><input type="text" id="instagramRepresentante" name="instagram_representante" value={editing.instagram_representante || ''} onChange={handleChange} placeholder="sem @" /></div><div className="form-group"><label htmlFor="instagramParceiro">Instagram Parceiro</label><input type="text" id="instagramParceiro" name="instagram_parceiro" value={editing.instagram_parceiro || ''} onChange={handleChange} placeholder="sem @" /></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="ctRepresentante">CT do Representante</label><input type="text" id="ctRepresentante" name="ct_representante" value={editing.ct_representante || ''} onChange={handleChange} /></div><div className="form-group"><label htmlFor="ctParceiro">CT do Parceiro</label><input type="text" id="ctParceiro" name="ct_parceiro" value={editing.ct_parceiro || ''} onChange={handleChange} /></div></div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="uniformeRepresentante">Uniforme Representante</label>
                  <select id="uniformeRepresentante" name="uniforme_representante" value={editing.uniforme_representante || ''} onChange={handleChange} className={editing.uniforme_representante === 'Segunda Inscrição' ? 'uniforme-segunda-inscricao' : ''}>
                    <option value="">Selecione o tamanho</option><option value="PP Masculino">PP Masculino</option><option value="P Masculino">P Masculino</option><option value="M Masculino">M Masculino</option><option value="G Masculino">G Masculino</option><option value="GG Masculino">GG Masculino</option><option value="XG Masculino">XG Masculino</option><option value="PP Feminino">PP Feminino</option><option value="P Feminino">P Feminino</option><option value="M Feminino">M Feminino</option><option value="G Feminino">G Feminino</option><option value="GG Feminino">GG Feminino</option><option value="XG Feminino">XG Feminino</option>
                    <option value="Personalizado">Personalizado</option><option value="Segunda Inscrição">Segunda Inscrição</option>
                  </select>
                  {editing.uniforme_representante === 'Personalizado' && (<input type="text" className="input-personalizado" placeholder="Digite o tamanho personalizado" value={uniformeRepresentantePersonalizado} onChange={(e) => setUniformeRepresentantePersonalizado(e.target.value)} style={{ marginTop: '10px' }} />)}
                </div>
                <div className="form-group">
                  <label htmlFor="uniformeParceiro">Uniforme Parceiro</label>
                  <select id="uniformeParceiro" name="uniforme_parceiro" value={editing.uniforme_parceiro || ''} onChange={handleChange} className={editing.uniforme_parceiro === 'Segunda Inscrição' ? 'uniforme-segunda-inscricao' : ''}>
                    <option value="">Selecione o tamanho</option><option value="PP Masculino">PP Masculino</option><option value="P Masculino">P Masculino</option><option value="M Masculino">M Masculino</option><option value="G Masculino">G Masculino</option><option value="GG Masculino">GG Masculino</option><option value="XG Masculino">XG Masculino</option><option value="PP Feminino">PP Feminino</option><option value="P Feminino">P Feminino</option><option value="M Feminino">M Feminino</option><option value="G Feminino">G Feminino</option><option value="GG Feminino">GG Feminino</option><option value="XG Feminino">XG Feminino</option>
                    <option value="Personalizado">Personalizado</option><option value="Segunda Inscrição">Segunda Inscrição</option>
                  </select>
                  {editing.uniforme_parceiro === 'Personalizado' && (<input type="text" className="input-personalizado" placeholder="Digite o tamanho personalizado" value={uniformeParceiroPersonalizado} onChange={(e) => setUniformeParceiroPersonalizado(e.target.value)} style={{ marginTop: '10px' }} />)}
                </div>
              </div>

              {/* NOVOS CAMPOS DE VALOR E OBSERVAÇÃO */}
              <div className="form-row">
                <div className="form-group"><label htmlFor="valorInscricao">Valor Base (R$)</label><input type="number" id="valorInscricao" name="valor_inscricao" value={editing.valor_inscricao || 0} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="desconto">DESCONTO (R$)</label><input type="number" id="desconto" name="desconto" value={editing.desconto || 0} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="outroValorPago">OUTRO VALOR PAGO (R$)</label><input type="number" id="outroValorPago" name="outro_valor_pago" value={editing.outro_valor_pago || 0} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group full-width"><label htmlFor="observacao">OBSERVAÇÃO</label><textarea id="observacao" name="observacao" value={editing.observacao || ''} onChange={handleChange} rows="3"></textarea></div>
              </div>
              {/* NOVOS CAMPOS DE ID */}
              <div className="form-row">
                <div className="form-group"><label htmlFor="idIntegrante1">ID Integrante 1</label><input type="text" id="idIntegrante1" name="id_integrante_1" value={editing.id_integrante_1 || ''} onChange={handleChange} /></div>
                <div className="form-group"><label htmlFor="idIntegrante2">ID Integrante 2</label><input type="text" id="idIntegrante2" name="id_integrante_2" value={editing.id_integrante_2 || ''} onChange={handleChange} /></div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statusPagamento">Status do Pagamento</label>
                  <select id="statusPagamento" name="status_pagamento" value={editing.status_pagamento || 'pendente'} onChange={handleChange}>
                    <option value="pendente">Pendente</option><option value="approved">Aprovado</option><option value="metade_pago">Metade Pago</option><option value="rejeitado">Rejeitado</option><option value="campeao">🏆 Campeão (Isento)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group" style={{ alignItems: 'center', display: 'flex' }}>
                  <label htmlFor="segundaInscricaoRep" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                    <input type="checkbox" id="segundaInscricaoRep" name="segunda_inscricao_rep" checked={!!editing.segunda_inscricao_rep} onChange={handleChange} style={{ marginRight: '10px', width: 'auto' }} />
                    Segunda inscrição do Representante?
                  </label>
                </div>
                <div className="form-group" style={{ alignItems: 'center', display: 'flex' }}>
                  <label htmlFor="segundaInscricaoParc" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }}>
                    <input type="checkbox" id="segundaInscricaoParc" name="segunda_inscricao_parc" checked={!!editing.segunda_inscricao_parc} onChange={handleChange} style={{ marginRight: '10px', width: 'auto' }} />
                    Segunda inscrição do Parceiro?
                  </label>
                </div>
              </div>

            </div>
            <div className="modal-footer"><button className="cancel-button" onClick={handleCloseEdit}>Cancelar</button><button className="save-button" onClick={handleSave}>💾 Salvar Alterações</button></div>
          </div>
        </div>
      )}

      {/* NOVO MODAL DE ADICIONAR INSCRIÇÃO */}
      {adding && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header"><h2>➕ Adicionar Nova Inscrição (Admin)</h2><button className="close-button" onClick={handleCloseAdd}>✕</button></div>
            <div className="modal-content">
              <div className="form-row"><div className="form-group"><label htmlFor="representante">Nome do Representante *</label><input type="text" id="representante" name="representante" value={novaInscricao.representante} onChange={handleNovaInscricaoChange} required /></div><div className="form-group"><label htmlFor="parceiro">Nome do Parceiro *</label><input type="text" id="parceiro" name="parceiro" value={novaInscricao.parceiro} onChange={handleNovaInscricaoChange} required /></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="celular">Celular</label><input type="text" id="celular" name="celular" value={novaInscricao.celular} onChange={handleNovaInscricaoChange} /></div><div className="form-group"><label htmlFor="categoria">Categoria *</label><select id="categoria" name="categoria" value={novaInscricao.categoria} onChange={handleNovaInscricaoChange} required><option value="">Selecione a categoria</option><option value="Feminino Escolinha">Feminino Escolinha</option><option value="Masculino Escolinha">Masculino Escolinha</option><option value="Feminino Iniciante">Feminino Iniciante</option><option value="Misto Escolinha">Misto Escolinha</option><option value="Misto Iniciante">Misto Iniciante</option><option value="Misto Intermediário">Misto Intermediário</option><option value="Masculino Iniciante">Masculino Iniciante</option><option value="Masculino Intermediário">Masculino Intermediário</option></select></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="instagramRepresentante">Instagram Representante</label><input type="text" id="instagramRepresentante" name="instagram_representante" value={novaInscricao.instagram_representante} onChange={handleNovaInscricaoChange} placeholder="sem @" /></div><div className="form-group"><label htmlFor="instagramParceiro">Instagram Parceiro</label><input type="text" id="instagramParceiro" name="instagram_parceiro" value={novaInscricao.instagram_parceiro} onChange={handleNovaInscricaoChange} placeholder="sem @" /></div></div>
              <div className="form-row"><div className="form-group"><label htmlFor="ctRepresentante">CT do Representante</label><input type="text" id="ctRepresentante" name="ct_representante" value={novaInscricao.ct_representante} onChange={handleNovaInscricaoChange} /></div><div className="form-group"><label htmlFor="ctParceiro">CT do Parceiro</label><input type="text" id="ctParceiro" name="ct_parceiro" value={novaInscricao.ct_parceiro} onChange={handleNovaInscricaoChange} /></div></div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="uniformeRepresentante">Uniforme Representante</label>
                  <select id="uniformeRepresentante" name="uniforme_representante" value={novaInscricao.uniforme_representante} onChange={handleNovaInscricaoChange}>
                    <option value="">Selecione o tamanho</option><option value="PP Masculino">PP Masculino</option><option value="P Masculino">P Masculino</option><option value="M Masculino">M Masculino</option><option value="G Masculino">G Masculino</option><option value="GG Masculino">GG Masculino</option><option value="XG Masculino">XG Masculino</option><option value="PP Feminino">PP Feminino</option><option value="P Feminino">P Feminino</option><option value="M Feminino">M Feminino</option><option value="G Feminino">G Feminino</option><option value="GG Feminino">GG Feminino</option><option value="XG Feminino">XG Feminino</option>
                    <option value="Personalizado">Personalizado</option><option value="Segunda Inscrição">Segunda Inscrição</option>
                  </select>
                  {novaInscricao.uniforme_representante === 'Personalizado' && (<input type="text" className="input-personalizado" placeholder="Digite o tamanho personalizado" value={uniformeNovaRepPersonalizado} onChange={(e) => setUniformeNovaRepPersonalizado(e.target.value)} style={{ marginTop: '10px' }} />)}
                </div>
                <div className="form-group">
                  <label htmlFor="uniformeParceiro">Uniforme Parceiro</label>
                  <select id="uniformeParceiro" name="uniforme_parceiro" value={novaInscricao.uniforme_parceiro} onChange={handleNovaInscricaoChange}>
                    <option value="">Selecione o tamanho</option><option value="PP Masculino">PP Masculino</option><option value="P Masculino">P Masculino</option><option value="M Masculino">M Masculino</option><option value="G Masculino">G Masculino</option><option value="GG Masculino">GG Masculino</option><option value="XG Masculino">XG Masculino</option><option value="PP Feminino">PP Feminino</option><option value="P Feminino">P Feminino</option><option value="M Feminino">M Feminino</option><option value="G Feminino">G Feminino</option><option value="GG Feminino">GG Feminino</option><option value="XG Feminino">XG Feminino</option>
                    <option value="Personalizado">Personalizado</option><option value="Segunda Inscrição">Segunda Inscrição</option>
                  </select>
                  {novaInscricao.uniforme_parceiro === 'Personalizado' && (<input type="text" className="input-personalizado" placeholder="Digite o tamanho personalizado" value={uniformeNovaParcPersonalizado} onChange={(e) => setUniformeNovaParcPersonalizado(e.target.value)} style={{ marginTop: '10px' }} />)}
                </div>
              </div>

              {/* NOVOS CAMPOS DE VALOR E OBSERVAÇÃO */}
              <div className="form-row">
                <div className="form-group"><label htmlFor="valorInscricao">Valor Base (R$)</label><input type="number" id="valorInscricao" name="valor_inscricao" value={novaInscricao.valor_inscricao} onChange={handleNovaInscricaoChange} /></div>
                <div className="form-group"><label htmlFor="desconto">DESCONTO (R$)</label><input type="number" id="desconto" name="desconto" value={novaInscricao.desconto} onChange={handleNovaInscricaoChange} /></div>
                <div className="form-group"><label htmlFor="outroValorPago">OUTRO VALOR PAGO (R$)</label><input type="number" id="outroValorPago" name="outro_valor_pago" value={novaInscricao.outro_valor_pago} onChange={handleNovaInscricaoChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group full-width"><label htmlFor="observacao">OBSERVAÇÃO</label><textarea id="observacao" name="observacao" value={novaInscricao.observacao} onChange={handleNovaInscricaoChange} rows="3"></textarea></div>
              </div>
              
              {/* NOVOS CAMPOS DE ID COM BUSCA */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="idIntegrante1">ID Integrante 1</label>
                  <input type="text" id="idIntegrante1" name="id_integrante_1" value={novaInscricao.id_integrante_1} onChange={handleNovaInscricaoChange} onBlur={handleBlurIntegrante1} />
                  {integrante1Data && integrante1Data.error && <p className="error-message">{integrante1Data.error}</p>}
                  {integrante1Data && !integrante1Data.error && <p className="success-message">Encontrado: {integrante1Data.nome_representante} ({integrante1Data.categoria})</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="idIntegrante2">ID Integrante 2</label>
                  <input type="text" id="idIntegrante2" name="id_integrante_2" value={novaInscricao.id_integrante_2} onChange={handleNovaInscricaoChange} onBlur={handleBlurIntegrante2} />
                  {integrante2Data && integrante2Data.error && <p className="error-message">{integrante2Data.error}</p>}
                  {integrante2Data && !integrante2Data.error && <p className="success-message">Encontrado: {integrante2Data.nome_representante} ({integrante2Data.categoria})</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statusPagamento">Status do Pagamento *</label>
                  <select id="statusPagamento" name="status_pagamento" value={novaInscricao.status_pagamento} onChange={handleNovaInscricaoChange} required>
                    <option value="pendente">Pendente</option><option value="approved">Aprovado</option><option value="metade_pago">Metade Pago</option><option value="rejeitado">Rejeitado</option><option value="campeao">🏆 Campeão (Isento)</option>
                  </select>
                </div>
              </div>

            </div>
            <div className="modal-footer"><button className="cancel-button" onClick={handleCloseAdd}>Cancelar</button><button className="save-button" onClick={handleAddInscricao}>➕ Adicionar Inscrição</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
