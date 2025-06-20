import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';
import * as XLSX from 'xlsx';

function AdminPage() {
  const [inscricoes, setInscricoes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [mostrarApenasPagos, setMostrarApenasPagos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ; 

  useEffect(() => {
    // Verificar se o usuário está autenticado
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

    // Verificar se o token ainda é válido
    verifyToken(token);
    
    // Buscar inscrições
    fetchInscricoes();
  }, [navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Token inválido');
      }
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

  const fetchInscricoes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/inscricoes`, {
        headers: getAuthHeaders()
      });

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
    if (!window.confirm('Tem certeza que deseja excluir esta inscrição? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/inscricao/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

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
    setEditing({ ...inscricao });
  };

  const handleSave = async () => {
    if (!editing) return;

    // Validação básica
    if (!editing.representante || !editing.parceiro || !editing.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/inscricao/${editing.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(editing)
      });

      if (!response.ok) {
        if (handleAuthError(response)) return;
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar inscrição');
      }

      alert('Inscrição atualizada com sucesso!');
      setEditing(null);
      fetchInscricoes(); // Recarregar dados
    } catch (err) {
      console.error('Erro ao editar inscrição:', err);
      alert(`Erro ao atualizar inscrição: ${err.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditing(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleCloseEdit = () => {
    setEditing(null);
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

  const handleRefresh = () => {
    fetchInscricoes();
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
      case 'approved':
        return '✅';
      case 'pendente':
        return '⏳';
      case 'rejeitado':
        return '❌';
      default:
        return '❓';
    }
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
            Pagas: <strong>{inscricoes.filter(i => i.status_pagamento === 'approved').length}</strong>
          </p>
        </div>
        <div className="header-right">
          <button className="logout-button" onClick={handleLogout}>
            🚪 Sair
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      <div className="admin-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Pesquisar por Representante, Parceiro, Categoria ou ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="action-buttons">
          <button className="refresh-button" onClick={handleRefresh}>
            🔄 Atualizar
          </button>
          <button
            className={`filter-button ${mostrarApenasPagos ? 'active' : ''}`}
            onClick={() => setMostrarApenasPagos(prev => !prev)}
          >
            {mostrarApenasPagos ? '👥 Mostrar Todos' : '💰 Apenas Pagos'}
          </button>
          <button className="export-button" onClick={exportarExcel}>
            📊 Exportar Pagos
          </button>
        </div>
      </div>

      <div className="inscricoes-container">
        {filteredInscricoes.length === 0 ? (
          <div className="no-data">
            <p>📭 Nenhuma inscrição encontrada</p>
            {search && (
              <button onClick={() => setSearch('')} className="clear-search">
                Limpar pesquisa
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="inscricoes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Representante</th>
                  <th>Celular</th>
                  <th>Parceiro</th>
                  <th>Instagram Rep.</th>
                  <th>Instagram Parc.</th>
                  <th>CT Rep.</th>
                  <th>CT Parc.</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscricoes.map(inscricao => (
                  <tr 
                    key={inscricao.id} 
                    className={inscricao.status_pagamento === 'approved' ? 'pago' : ''}
                  >
                    <td className="id-cell">{inscricao.id}</td>
                    <td className="name-cell">{inscricao.representante}</td>
                    <td className="phone-cell">{inscricao.celular}</td>
                    <td className="name-cell">{inscricao.parceiro}</td>
                    <td className="instagram-cell">@{inscricao.instagram_representante}</td>
                    <td className="instagram-cell">@{inscricao.instagram_parceiro}</td>
                    <td className="ct-cell">{inscricao.ct_representante || '-'}</td>
                    <td className="ct-cell">{inscricao.ct_parceiro || '-'}</td>
                    <td className="category-cell">{inscricao.categoria}</td>
                    <td className="date-cell">{new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${inscricao.status_pagamento}`}>
                        {getStatusIcon(inscricao.status_pagamento)} {inscricao.status_pagamento}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEdit(inscricao)}
                        title="Editar inscrição"
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDelete(inscricao.id, inscricao.categoria)}
                        title="Excluir inscrição"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h2>✏️ Editar Inscrição #{editing.id}</h2>
              <button className="close-button" onClick={handleCloseEdit}>✕</button>
            </div>

            <div className="modal-content">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="representante">Nome do Representante *</label>
                  <input 
                    type="text" 
                    id="representante"
                    name="representante" 
                    value={editing.representante || ''} 
                    onChange={handleChange} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="parceiro">Nome do Parceiro *</label>
                  <input 
                    type="text" 
                    id="parceiro"
                    name="parceiro" 
                    value={editing.parceiro || ''} 
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="celular">Celular</label>
                  <input 
                    type="text" 
                    id="celular"
                    name="celular" 
                    value={editing.celular || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoria">Categoria *</label>
                  <select 
                    id="categoria"
                    name="categoria" 
                    value={editing.categoria || ''} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione a categoria</option>
                    <option value="Open">Open</option>
                    <option value="Escolinha">Escolinha</option>
                    <option value="Feminino Iniciante">Feminino Iniciante</option>
                    <option value="Misto Escolinha">Misto Escolinha</option>
                    <option value="Misto Iniciante">Misto Iniciante</option>
                    <option value="Misto Intermediário">Misto Intermediário</option>
                    <option value="Masculino Iniciante">Masculino Iniciante</option>
                    <option value="Masculino Intermediário">Masculino Intermediário</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="instagramRepresentante">Instagram Representante</label>
                  <input 
                    type="text" 
                    id="instagramRepresentante"
                    name="instagram_representante" 
                    value={editing.instagram_representante || ''} 
                    onChange={handleChange} 
                    placeholder="sem @"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="instagramParceiro">Instagram Parceiro</label>
                  <input 
                    type="text" 
                    id="instagramParceiro"
                    name="instagram_parceiro" 
                    value={editing.instagram_parceiro || ''} 
                    onChange={handleChange} 
                    placeholder="sem @"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ctRepresentante">CT do Representante</label>
                  <input 
                    type="text" 
                    id="ctRepresentante"
                    name="ct_representante" 
                    value={editing.ct_representante || ''} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ctParceiro">CT do Parceiro</label>
                  <input 
                    type="text" 
                    id="ctParceiro"
                    name="ct_parceiro" 
                    value={editing.ct_parceiro || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="uniformeRepresentante">Uniforme Representante</label>
                  <select 
                    id="uniformeRepresentante"
                    name="uniforme_representante" 
                    value={editing.uniforme_representante || ''} 
                    onChange={handleChange}
                  >
                    <option value="">Selecione o tamanho</option>
                    <option value="PP Masculino">PP Masculino</option>
                    <option value="P Masculino">P Masculino</option>
                    <option value="M Masculino">M Masculino</option>
                    <option value="G Masculino">G Masculino</option>
                    <option value="GG Masculino">GG Masculino</option>
                    <option value="PP Feminino">PP Feminino</option>
                    <option value="P Feminino">P Feminino</option>
                    <option value="M Feminino">M Feminino</option>
                    <option value="G Feminino">G Feminino</option>
                    <option value="GG Feminino">GG Feminino</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="uniformeParceiro">Uniforme Parceiro</label>
                  <select 
                    id="uniformeParceiro"
                    name="uniforme_parceiro" 
                    value={editing.uniforme_parceiro || ''} 
                    onChange={handleChange}
                  >
                    <option value="">Selecione o tamanho</option>
                    <option value="PP Masculino">PP Masculino</option>
                    <option value="P Masculino">P Masculino</option>
                    <option value="M Masculino">M Masculino</option>
                    <option value="G Masculino">G Masculino</option>
                    <option value="GG Masculino">GG Masculino</option>
                    <option value="PP Feminino">PP Feminino</option>
                    <option value="P Feminino">P Feminino</option>
                    <option value="M Feminino">M Feminino</option>
                    <option value="G Feminino">G Feminino</option>
                    <option value="GG Feminino">GG Feminino</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="statusPagamento">Status do Pagamento</label>
                  <select 
                    id="statusPagamento"
                    name="status_pagamento" 
                    value={editing.status_pagamento || 'pendente'} 
                    onChange={handleChange}
                  >
                    <option value="pendente">Pendente</option>
                    <option value="approved">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={handleCloseEdit}>
                Cancelar
              </button>
              <button className="save-button" onClick={handleSave}>
                💾 Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;

