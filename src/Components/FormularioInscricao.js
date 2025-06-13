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
    const res = await fetch(`http://localhost:5000/vagas/${categoria}`);
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
    segundaInscricao: false,
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
      const res = await fetch('http://localhost:5000/inscricao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Inscrição enviada com sucesso!');
        setFormData({
          representante: '',
          celular: '',
          parceiro: '',
          instagramRepresentante: '',
          instagramParceiro: '',
          uniformeRepresentante: '',
          uniformeParceiro: '',
          categoria: '',
          ctRepresentante: '',
          ctParceiro: '',
          segundaInscricao: false,
          aceitarTermos: false, // Resetar o estado do checkbox
        });
        setCamposInvalidos({});
        setError('');
        setMessage('');
      } else {
        alert('Erro ao enviar inscrição.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao conectar com o servidor.');
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

          {/* Instagram */}
          <div className='modal-separado'>
            <div className='titulo-inscricao'>
              <CiInstagram />
              <p>Instagram</p>
            </div>
            <div className='row'>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> @ do Representante </p>
                <input
                  type="text"
                  name="instagramRepresentante"
                  value={formData.instagramRepresentante}
                  onChange={handleChange}
                  placeholder="@ do Representante *"
                  className={`input ${camposInvalidos.instagramRepresentante ? 'input-invalido' : ''}`}
                />
              </div>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> @ do Parceiro </p>
                <input
                  type="text"
                  name="instagramParceiro"
                  value={formData.instagramParceiro}
                  onChange={handleChange}
                  placeholder="@ do Parceiro *"
                  className={`input ${camposInvalidos.instagramParceiro ? 'input-invalido' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* CTs */}
          <div className='modal-separado'>
            <div className='titulo-inscricao'>
             <MdOutlineStadium />
              <p className='dados-dupla'> CTs </p>
            </div>
            <div className='row'>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> CT do Representante </p>
                <input
                  type="text"
                  name="ctRepresentante"
                  value={formData.ctRepresentante}
                  onChange={handleChange}
                  placeholder="CT do Representante"
                  className="input"
                />
              </div>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> CT do Parceiro </p>
                <input
                  type="text"
                  name="ctParceiro"
                  value={formData.ctParceiro}
                  onChange={handleChange}
                  placeholder="CT do Parceiro"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Tamanho dos Uniformes */}
          <div className='modal-separado'>
            <div className='titulo-inscricao'>
              <IoShirt />
              <p className='dados-dupla'> Tamanho dos Uniformes </p>
            </div>
            <div className='row'>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> Tamanho - Representante </p>
                <select
                  className={`input ${camposInvalidos.uniformeRepresentante ? 'input-invalido' : ''}`}
                  name="uniformeRepresentante"
                  value={formData.uniformeRepresentante}
                  onChange={handleChange}
                >
                  <option>Selecione o tamanho</option>
                  <option>PP</option>
                  <option>P</option>
                  <option>M</option>
                  <option>G</option>
                  <option>GG</option>
                </select>
              </div>
              <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> Tamanho - Parceiro </p>
                <select
                  className={`input ${camposInvalidos.uniformeParceiro ? 'input-invalido' : ''}`}
                  name="uniformeParceiro"
                  value={formData.uniformeParceiro}
                  onChange={handleChange}
                >
                  <option>Selecione o tamanho</option>
                  <option>PP</option>
                  <option>P</option>
                  <option>M</option>
                  <option>G</option>
                  <option>GG</option>
                </select>
              </div>
            </div>
          </div>

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
                <option>Masculino Intermediário </option>
              
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

          {/* Segunda Inscrição */}
          <div className="modal-separado">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="segundaInscricao"
                name="segundaInscricao"
                className="segundaInscricao"
                checked={formData.segundaInscricao}
                onChange={handleChange}
              />
              <label htmlFor="segundaInscricao">Segunda inscrição do representante</label>
            </div>
          </div>

          {/* Termos e Condições */}
          <div className="modal-separado">
            <div className="termos-container">
              <input
                type="checkbox"
                id="AceitarTermos"
                name="aceitarTermos"
                className="AceitarTermos"
                checked={formData.aceitarTermos}
                onChange={handleChange}
              />
              <label htmlFor="AceitarTermos">
                Aceito os{" "}
                <a href="/docs/termos-e-condicoes2.pdf" target="_blank" rel="noopener noreferrer">
                  Termos e Condições
                </a>{" "}
                e o{" "}
                <a href="/docs/termo-privacidade.pdf" target="_blank" rel="noopener noreferrer">
                  Termo de Privacidade
                </a>
              </label>
            </div>
          </div>

          {/* Exibir mensagem de erro se os termos não forem aceitos */}
          {camposInvalidos.aceitarTermos && (
            <p style={{ color: 'red', marginTop: '10px' }}>
              Por favor, aceite os Termos e Condições.
            </p>
          )}

          {/* Exibir a mensagem para segunda inscrição */}
          {formData.segundaInscricao && (
            <p style={{ color: 'red', marginTop: '10px' }}>
              Para segunda inscrição, por favor, nos mande um direct!
            </p>
          )}

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          {/* Botão desativado quando "Segunda inscrição" estiver marcada ou não há vagas */}
          <button
            className='botao-inscricao'
            onClick={handleSubmit}
            disabled={formData.segundaInscricao || isCategoriaSemVagas}  // Desativa o botão se "Segunda inscrição" ou sem vagas
          >
            Inscrever-se
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormularioInscricao;
