import { useState, useEffect } from 'react';
import { FaTrophy } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { IoShirt } from "react-icons/io5";
import { CiInstagram } from "react-icons/ci";
import { MdOutlineStadium } from "react-icons/md";
import "../styles/formularioinscricao.css";

function FormularioInscricao() {
  const [vagasRestantes, setVagasRestantes] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');

  useEffect(() => {
    if (categoriaSelecionada && categoriaSelecionada !== 'Categoria') {
      checkVagasDisponiveis(categoriaSelecionada);
    } else {
      setVagasRestantes(null);
    }
  }, [categoriaSelecionada]);

  const checkVagasDisponiveis = async (categoria) => {
    try {
      const res = await fetch(`http://localhost:5000/vagas/${categoria}` );
      const data = await res.json();
      setVagasRestantes(data.vagas);
    } catch (err) {
      setVagasRestantes(null);
      console.error('Erro ao verificar vagas:', err);
    }
  };

  const isCategoriaSemVagas = vagasRestantes === 0;
  const temVagasRestantes = vagasRestantes !== null && vagasRestantes <= 6 && vagasRestantes > 0;

  const [formData, setFormData] = useState({
    representante: '',
    parceiro: '',
    instagramRepresentante: '',
    instagramParceiro: '',
    uniformeRepresentante: '',
    uniformeParceiro: '',
    categoria: '',
    ctRepresentante: '',
    ctParceiro: '',
    celular: '',
    aceitarTermos: false, // Novo estado para o checkbox
  });

  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    const camposObrigatorios = [
      'representante',
      'parceiro',
      'instagramRepresentante',
      'instagramParceiro',
      'uniformeRepresentante',
      'uniformeParceiro',
      'categoria',
      'aceitarTermos', // Verifica se o checkbox de termos foi marcado
    ];

    const novosInvalidos = {};

    camposObrigatorios.forEach((campo) => {
      if (!formData[campo] || formData[campo] === 'Categoria' || formData[campo] === 'Selecione o tamanho') {
        novosInvalidos[campo] = true;
      }
    });

    if (!formData.aceitarTermos) {
      novosInvalidos.aceitarTermos = true; // Marcar como inválido se não for aceito
    }

    setCamposInvalidos(novosInvalidos);

    if (Object.keys(novosInvalidos).length > 0) {
      setError('Por favor, preencha todos os campos obrigatórios e aceite os Termos e Condições.');
      return;
    }

    try {
      // Primeiro, verifica as vagas (a rota /inscricao no backend agora só verifica vagas)
      const vagasRes = await fetch('http://localhost:5000/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData ), // Envia o formData para a verificação de vagas
      });

      if (!vagasRes.ok) {
        const errorData = await vagasRes.json();
        setError(errorData.message || 'Erro ao verificar vagas.');
        return; // Para a execução se não houver vagas
      }

      // Se houver vagas, envia os dados da inscrição para o banco
      const inscricaoRes = await fetch('http://localhost:5000/inscricao/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Envia os dados do formulário para salvar no banco de dados
      });

      if (inscricaoRes.ok) {
        const inscricaoData = await inscricaoRes.json();
        setMessage('Inscrição realizada com sucesso!');
        // Opcionalmente, você pode redirecionar ou limpar o formulário aqui
      } else {
        const errorData = await inscricaoRes.json();
        setError(errorData.message || 'Erro ao salvar inscrição.');
      }

    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o servidor ou processar a inscrição.');
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <div className='container-inscricao'>
        <div className='formulario-de-inscricao'>
          <FaTrophy />
          <p className='inscricao'> Formulário de Inscrição </p>
        </div>

        <div className='formulario-iscricao'>
          {/* Dados da Dupla */}
          <div className='modal-separado'>
            <div className='titulo-inscricao'>
              <IoMdPeople />
              <p className='dados-dupla'> Dados da Dupla </p>
            </div>
            <div className='row'>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> Nome do Representante </p>
                <input
                  type="text"
                  name="representante"
                  value={formData.representante}
                  onChange={handleChange}
                  placeholder="Nome do Representante *"
                  className={`input ${camposInvalidos.representante ? 'input-invalido' : ''}`}
                />
              </div>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> Nome do Parceiro </p>
                <input
                  type="text"
                  name="parceiro"
                  value={formData.parceiro}
                  onChange={handleChange}
                  placeholder="Nome do Parceiro *"
                  className={`input ${camposInvalidos.parceiro ? 'input-invalido' : ''}`}
                />
              </div>
            </div>
            <div className="row">
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> Telefone do Representante </p>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="Telefone com DDD *"
                  className={`input ${camposInvalidos.parceiro ? 'input-invalido' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Outros campos permanecem os mesmos */}

          {/* Categoria */}
          <div className='modal-separado'>
            <div className='row'>
              <p className='titulo-inscricao'>Categoria</p>
              <select
                className={`input ${camposInvalidos.categoria ? 'input-invalido' : ''}`}
                name="categoria"
                value={formData.categoria}
                onChange={e => {
                  handleChange(e);
                  setCategoriaSelecionada(e.target.value);
                }}
              >
                <option>Categoria</option>
                <option>Open</option>
                <option>Escolinha</option>
                <option>Feminino Iniciante</option>
                <option>Misto Escolinha</option>
                <option>Misto Iniciante</option>
                <option>Misto Intermediário</option>
                <option>Masculino Iniciante</option>
                <option>Masculino Intermediário</option>
              </select>
              {temVagasRestantes && (
                <p style={{ color: 'orange', marginTop: '10px' }}>
                  Restam apenas {vagasRestantes} vagas nesta categoria!
                </p>
              )}
              {isCategoriaSemVagas && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                  Não há mais vagas nesta categoria.
                </p>
              )}
            </div>
          </div>

          {/* Mensagens de erro ou sucesso */}
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}

          {/* Botão de Inscrição */}
          <button
            className='botao-inscricao'
            onClick={handleSubmit}
            disabled={isCategoriaSemVagas}  // Desativa o botão se não houver vagas
          >
            Inscrever-se
          </button>

        </div>
      </div>
    </div>
  );
}

export default FormularioInscricao;
