import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';
import * as XLSX from 'xlsx';

function AdminPage() {
  const [inscricoes, setInscricoes] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [mostrarApenasPagos, setMostrarApenasPagos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInscricoes();
  }, []);

  const fetchInscricoes = () => {
    fetch('http://localhost:5000/inscricoes')
      .then(response => response.json())
      .then(data => setInscricoes(data))
      .catch(error => console.error('Erro ao buscar inscrições:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/inscricao/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        alert('Inscrição excluída com sucesso!');
        setInscricoes(inscricoes.filter(item => item._id !== id));
      })
      .catch(error => {
        console.error('Erro ao excluir inscrição:', error);
      });
  };

  const handleEdit = (inscricao) => {
    setEditing(inscricao);
  };

  const handleSave = () => {
    if (editing) {
      fetch(`http://localhost:5000/inscricao/${editing._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
        .then(response => response.json())
        .then(() => {
          alert('Inscrição atualizada com sucesso!');
          setEditing(null);
          fetchInscricoes();
        })
        .catch(error => console.error('Erro ao editar inscrição:', error));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditing(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    .filter(inscricao => !mostrarApenasPagos || inscricao.statusPagamento === 'aprovado');

  const handleLogout = () => {
    navigate('/login');
  };

  const handleRefresh = () => {
    fetchInscricoes();
  };

  const exportarExcel = () => {
    const pagos = inscricoes.filter(i => i.statusPagamento === 'aprovado');
    const dados = pagos.map(i => ({
      ID: i.id,
      Representante: i.representante,
      Parceiro: i.parceiro,
      Categoria: i.categoria,
      Celular: i.celular
    }));
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagos');
    XLSX.writeFile(wb, 'inscricoes_pagas.xlsx');
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administração - Inscrições</h1>

      <input
        type="text"
        className="search-input"
        placeholder="Pesquisar por Representante, Parceiro ou Categoria"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className='botoes-admin'>
        <div className='row'>
          <div className='col-4'>
      <button className="refresh-button" onClick={handleRefresh}>Atualizar Dados</button>
    </div>
    <div className='col-4'>
      <button
        className="filter-button"
        onClick={() => setMostrarApenasPagos(prev => !prev)}
      >
        {mostrarApenasPagos ? 'Mostrar Todos' : 'Mostrar Apenas Pagos'}
      </button>
</div>
<div className='col-4'>
      <button className="export-button" onClick={exportarExcel}>Exportar Pagos</button>
      </div>
      </div> 
    </div>
      <div className="inscricoes-list">
        <table className="inscricoes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Representante</th>
              <th>Celular</th>
              <th>Parceiro</th>
              <th>Instagram Representante</th>
              <th>Instagram Parceiro</th>
              <th>Ct Representante</th>
              <th>Ct Parceiro</th>
              <th>Categoria</th>
              <th>Pago</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
              {filteredInscricoes.map(inscricao => (
             <tr key={inscricao._id} className={inscricao.statusPagamento === 'aprovado' ? 'pago' : ''}>
              <td>{inscricao.id}</td>
              <td>{inscricao.representante}</td>
              <td>{inscricao.celular}</td>
              <td>{inscricao.parceiro}</td>
              <td>{inscricao.instagramRepresentante}</td>
              <td>{inscricao.instagramParceiro}</td>
              <td>{inscricao.ctRepresentante}</td>
              <td>{inscricao.ctParceiro}</td>
              <td>{inscricao.categoria}</td>
              <td>
                {inscricao.statusPagamento === 'aprovado' ? '✅' : '❌'}
              </td>
              <td>
                <button className="edit-button" onClick={() => handleEdit(inscricao)}>Editar</button>
                <button className="delete-button" onClick={() => handleDelete(inscricao._id)}>Excluir</button>
            </td>
          </tr>
         ))}
</tbody>
        </table>
      </div>

      {editing && (
        <div className="edit-form">
          <button className="close-button" onClick={handleCloseEdit}>X</button>
          <h2>Editar Inscrição</h2>

          <label htmlFor="id">ID</label>
          <input type="text" name="id" value={editing.id} onChange={handleChange} disabled />

          <label htmlFor="representante">Nome do Representante</label>
          <input type="text" name="representante" value={editing.representante} onChange={handleChange} />

          <label htmlFor="parceiro">Nome do Parceiro</label>
          <input type="text" name="parceiro" value={editing.parceiro} onChange={handleChange} />

          <label htmlFor="instagramRepresentante">Instagram Representante</label>
          <input type="text" name="instagramRepresentante" value={editing.instagramRepresentante} onChange={handleChange} />

          <label htmlFor="instagramParceiro">Instagram Parceiro</label>
          <input type="text" name="instagramParceiro" value={editing.instagramParceiro} onChange={handleChange} />

          <label htmlFor="ctRepresentante">CT do Representante</label>
          <input type="text" name="ctRepresentante" value={editing.ctRepresentante} onChange={handleChange} />

          <label htmlFor="ctParceiro">CT do Parceiro</label>
          <input type="text" name="ctParceiro" value={editing.ctParceiro} onChange={handleChange} />

          <label htmlFor="categoria">Categoria</label>
          <select name="categoria" value={editing.categoria} onChange={handleChange}>
            <option>Categoria</option>
            <option>Open</option>
            <option>Misto Iniciante</option>
            <option>Misto Intermediário</option>
            <option>Escolinha</option>
            <option>Masculino Iniciante</option>
            <option>Masculino A</option>
            <option>Feminino Iniciante</option>
          </select>

          <button className="save-button" onClick={handleSave}>Salvar</button>
        </div>
      )}

      <button className="back-button" onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default AdminPage;
