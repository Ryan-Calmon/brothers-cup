import { useState, useEffect } from 'react';
import { FaTrophy } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { IoShirt } from "react-icons/io5";
import { CiInstagram } from "react-icons/ci";
import { MdOutlineStadium } from "react-icons/md";
import "../styles/formularioinscricao.css";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

initMercadoPago(`${process.env.MP_PUBLIC_KEY}`);

function FormularioInscricao() {
  const [vagasRestantes, setVagasRestantes] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [segundaInscricao, setSegundaInscricao] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; 
  
  useEffect(() => {
    if (categoriaSelecionada && categoriaSelecionada !== 'Categoria') {
      checkVagasDisponiveis(categoriaSelecionada);
    } else {
      setVagasRestantes(null);
    }
  }, [categoriaSelecionada]);

  const checkVagasDisponiveis = async (categoria) => {
    try {
      const res = await fetch(`${BACKEND_URL}/vagas/${categoria}` );
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
    celular: '', // Adicionando celular
    aceitarTermos: false,
  });

  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

 const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  // Se já estiver enviando a inscrição, retorna
  if (isSubmitting) return;
  setIsSubmitting(true);

  // Validação dos campos obrigatórios
  const camposObrigatorios = [
    'representante',
    'parceiro',
    'instagramRepresentante',
    'instagramParceiro',
    'uniformeRepresentante',
    'uniformeParceiro',
    'categoria',
    'celular',
    'aceitarTermos', // Verifica se o checkbox de termos foi marcado
  ];

  const novosInvalidos = {};
  
  camposObrigatorios.forEach((campo) => {
    if (!formData[campo] || formData[campo] === 'Categoria' || formData[campo] === 'Selecione o tamanho') {
      novosInvalidos[campo] = true;
    }
  });

  if (!formData.aceitarTermos) {
    novosInvalidos.aceitarTermos = true;
  }

  setCamposInvalidos(novosInvalidos);

  if (Object.keys(novosInvalidos).length > 0) {
    setError('Por favor, preencha todos os campos obrigatórios e aceite os Termos e Condições.');
    setIsSubmitting(false);
    return;
  }

  // Passo 1: Criar a preferência de pagamento
  const title = 'Inscrição Brothers Cup';
  const price = 250; // Preço da inscrição
  const quantity = 1;

  try {
    // Enviar os dados para o backend criar a preferência de pagamento
    const preferenceResponse = await fetch(`${BACKEND_URL}/mercadopago/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price, quantity }),
    });

    const preferenceData = await preferenceResponse.json();

    if (preferenceResponse.ok) {
      // Receber o preferenceId do backend e atualizar o estado
      setPreferenceId(preferenceData.preferenceId);
    } else {
      console.error('Erro ao criar preferência', preferenceData);
      setError('Erro ao criar preferência de pagamento');
      setIsSubmitting(false);
      return;
    }
  } catch (error) {
    console.error('Erro na requisição para criar preferência:', error);
    setError('Erro na requisição para criar preferência');
    setIsSubmitting(false);
    return;
  }

  // Passo 2: Enviar a inscrição para o backend
  try {
    // Enviar os dados da inscrição
    const inscricaoRes = await fetch(`${BACKEND_URL}/inscricoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (inscricaoRes.ok) {
      const inscricaoData = await inscricaoRes.json();
      setMessage("Inscrição realizada com sucesso!");

      // Adicione estas linhas para zerar o formulário
      setFormData({
        representante: "",
        parceiro: "",
        instagramRepresentante: "",
        instagramParceiro: "",
        uniformeRepresentante: "",
        uniformeParceiro: "",
        categoria: "",
        ctRepresentante: "",
        ctParceiro: "",
        celular: "",
        aceitarTermos: false,
      });
      setCamposInvalidos({});
      setError("");
      setCategoriaSelecionada(""); // Zera a categoria selecionada
      setVagasRestantes(null); // Zera as vagas restantes
      setSegundaInscricao(false); // Zera a segunda inscrição
    } else {
      const errorData = await inscricaoRes.json();
      setError(errorData.message || 'Erro ao salvar inscrição.');
    }
  } catch (err) {
    console.error(err);
    setError('Erro ao conectar com o servidor ou processar a inscrição.');
  } finally {
    setIsSubmitting(false);
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
            {/* Adicionando número de celular do representante */}
            <div className='row'>
              <div className='col-12'>
                <p className='sobre-inscricao'> Celular do Representante </p>
                <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  placeholder="Celular com DDD *"
                  className={`input ${camposInvalidos.celular ? 'input-invalido' : ''}`}
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
                  <option>PP Masculino</option>
                  <option>P Masculino</option>
                  <option>M Masculino</option>
                  <option>G Masculino</option>
                  <option>GG Masculino</option>
                  <option>PP Feminino</option>
                  <option>P Feminino</option>
                  <option>M Feminino</option>
                  <option>G Feminino</option>
                  <option>GG Feminino</option>
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
                  <option>PP Masculino</option>
                  <option>P Masculino</option>
                  <option>M Masculino</option>
                  <option>G Masculino</option>
                  <option>GG Masculino</option>
                  <option>PP Feminino</option>
                  <option>P Feminino</option>
                  <option>M Feminino</option>
                  <option>G Feminino</option>
                  <option>GG Feminino</option>
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
                <option>Masculino Intermediário</option>
              </select>
              {temVagasRestantes && (
                <p style={{ color: 'orange', marginTop: '10px' }}>
                  Restam apenas {vagasRestantes} vagas nesta categoria!
                </p>
              )}
              {isCategoriaSemVagas && (
                <p style={{ color: 'red', marginTop: '10px' }} >
                  Não há mais vagas nesta categoria.
                </p>
              )}
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className='modal-separado'>
            <p className='titulo-inscricao'>Forma de Pagamento</p>
            <select
              className='input'
              name='formaPagamento'
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <option value="pix">PIX</option>
              <option value="cartao">Cartão de Crédito</option>
            </select>
          </div>

          {/* Segunda Inscrição */}
          <div className="modal-separado">
            <div className="checkbox-wrapper">
              <input
                type="checkbox"
                id="segundaInscricao"
                name="segundaInscricao"
                className="segundaInscricao"
                checked={segundaInscricao}
                onChange={() => setSegundaInscricao(!segundaInscricao)}  // Alterna entre true/false
              />
              <label htmlFor="segundaInscricao">
                Segunda inscrição
              </label>
            </div>

            {/* Exibe a mensagem em vermelho se a segunda inscrição estiver marcada */}
            {segundaInscricao && (
              <p style={{ color: 'red', marginTop: '10px' }}>
                Para sua segunda inscrição, nos chame no direct!
              </p>
            )}
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
                <a href="/docs/termos-brotherscup.pdf" target="_blank" rel="noopener noreferrer">
                  Termos e Condições
                </a>{" "}
                e o{" "}
                <a href="/docs/termo-privacidade.pdf" target="_blank" rel="noopener noreferrer">
                  Termo de Privacidade
                </a>
              </label>
            </div>
          </div>

          {/* Botão de Inscrição - Desativado se "Segunda Inscrição" for marcada */}
           <button
      className='botao-inscricao'
      onClick={handleSubmit}
      disabled={isSubmitting || isCategoriaSemVagas}
    >
      {isSubmitting ? "Enviando..." : "Inscrever-se"}
    </button>

    {/* Renderiza o Wallet do Mercado Pago quando o preferenceId estiver disponível */}
    {preferenceId && (
      <div style={{ marginTop: '20px' }}>
        <Wallet initialization={{ preferenceId }} />
      </div>
    )}


          {/* Exibir mensagens de erro ou sucesso */}
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default FormularioInscricao;


