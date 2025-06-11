import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Adicionando o useNavigate
import '../styles/AdminPage.css';

function AdminPage() {
  const [inscricoes, setInscricoes] = useState([]);
  const [editing, setEditing] = useState(null); // Estado para controlar a edição
  const [search, setSearch] = useState(''); // Estado para controlar a pesquisa
  const navigate = useNavigate(); // Adicionando o hook de navegação

  useEffect(() => {
    // Carregar as inscrições do backend na primeira vez
    fetchInscricoes();
  }, []);

  const fetchInscricoes = () => {
    fetch('http://localhost:5000/inscricoes')
      .then(response => response.json())
      .then(data => setInscricoes(data))
      .catch(error => console.error('Erro ao buscar inscrições:', error));
  };

  const handleDelete = (id) => {
    // Função para excluir inscrição
    fetch(`http://localhost:5000/inscricao/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        alert('Inscrição excluída com sucesso!');
        setInscricoes(inscricoes.filter(item => item._id !== id)); // Filtra pelo _id (ObjectId)
      })
      .catch(error => {
        console.error('Erro ao excluir inscrição:', error);
      });
  };

  const handleEdit = (inscricao) => {
    // Iniciar edição com os dados da inscrição
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
          setEditing(null); // Limpar o estado de edição
          fetchInscricoes(); // Atualiza as inscrições
        })
        .catch(error => console.error('Erro ao editar inscrição:', error));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditing(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCloseEdit = () => {
    setEditing(null); // Fecha o modal de edição
  };

  // Função para filtrar inscrições
  const filteredInscricoes = inscricoes.filter(inscricao => 
    inscricao.representante.toLowerCase().includes(search.toLowerCase()) || 
    inscricao.parceiro.toLowerCase().includes(search.toLowerCase()) ||
    inscricao.categoria.toLowerCase().includes(search.toLowerCase()) || 
    inscricao.id.toString().includes(search) 
  );

  // Função de logout, que redireciona para a página de login
  const handleLogout = () => {
    // Redireciona para a página de login
    navigate('/login');
  };

  // Função para atualizar as inscrições (botão de refresh)
  const handleRefresh = () => {
    fetchInscricoes(); // Faz uma nova requisição para atualizar os dados
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administração - Inscrições</h1>

      {/* Campo de pesquisa */}
      <input
        type="text"
        className="search-input"
        placeholder="Pesquisar por Representante, Parceiro ou Categoria"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Botão de Refresh */}
      <button className="refresh-button" onClick={handleRefresh}>Atualizar Dados</button>

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
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredInscricoes.map(inscricao => (
              <tr key={inscricao._id}> {/* Usando _id como chave */}
                <td>{inscricao.id}</td> {/* Exibe o ID gerado manualmente */}
                <td>{inscricao.representante}</td>
                <td>{inscricao.celular}</td>
                <td>{inscricao.parceiro}</td>
                <td>{inscricao.instagramRepresentante}</td>
                <td>{inscricao.instagramParceiro}</td>
                <td>{inscricao.ctRepresentante}</td>
                <td>{inscricao.ctParceiro}</td>
                <td>{inscricao.categoria}</td>
                <td>
                  <button className="edit-button" onClick={() => handleEdit(inscricao)}>
                    Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(inscricao._id)} // Usando _id (ObjectId)
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="edit-form">
          {/* Botão de fechar (X) */}
          <button className="close-button" onClick={handleCloseEdit}>X</button>

          <h2>Editar Inscrição</h2>

          {/* ID da inscrição (somente leitura) */}
          <label htmlFor="id">ID</label>
          <input
            type="text"
            name="id"
            value={editing.id}
            onChange={handleChange}
            placeholder="ID da Inscrição"
            disabled
          />

          {/* Campos editáveis */}
          <label htmlFor="representante">Nome do Representante</label>
          <input
            type="text"
            name="representante"
            value={editing.representante}
            onChange={handleChange}
            placeholder="Nome do Representante"
          />

          <label htmlFor="parceiro">Nome do Parceiro</label>
          <input
            type="text"
            name="parceiro"
            value={editing.parceiro}
            onChange={handleChange}
            placeholder="Nome do Parceiro"
          />

          <label htmlFor="instagramRepresentante">Instagram Representante</label>
          <input
            type="text"
            name="instagramRepresentante"
            value={editing.instagramRepresentante}
            onChange={handleChange}
            placeholder="Instagram Representante"
          />

          <label htmlFor="instagramParceiro">Instagram Parceiro</label>
          <input
            type="text"
            name="instagramParceiro"
            value={editing.instagramParceiro}
            onChange={handleChange}
            placeholder="Instagram Parceiro"
          />

          <label htmlFor="ctRepresentante">CT do Representante</label>
          <input
            type="text"
            name="ctRepresentante"
            value={editing.ctRepresentante}
            onChange={handleChange}
            placeholder="CT do Representante"
          />

          <label htmlFor="ctParceiro">CT do Parceiro</label>
          <input
            type="text"
            name="ctParceiro"
            value={editing.ctParceiro}
            onChange={handleChange}
            placeholder="CT do Parceiro"
          />

          <label htmlFor="categoria">Categoria</label>
          <select
            name="categoria"
            value={editing.categoria}
            onChange={handleChange}
          >
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
