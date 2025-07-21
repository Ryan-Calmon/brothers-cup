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
  const [formaPagamento, setFormaPagamento] = useState('pix'); // Restaurando forma de pagamento
  const [segundaInscricao, setSegundaInscricao] = useState(false);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ; 

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
    celular: '',
    aceitarTermos: false,
  });

  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // Função para calcular o valor baseado na forma de pagamento
  const getValorInscricao = () => {
    return formaPagamento === 'cartao' ? 263 : 250;
  };

  // Função para verificar se o botão deve estar desabilitado
  const isBotaoDesabilitado = () => {
    return isSubmitting || isCategoriaSemVagas || segundaInscricao;
  };

  // Função para obter a mensagem de status do botão
  const getMensagemStatus = () => {
    if (segundaInscricao) {
      return "Para sua segunda inscrição, nos chame no direct!";
    }
    if (isCategoriaSemVagas) {
      return "Não há mais vagas nesta categoria.";
    }
    return null;
  };

  const handleSubmit = async () => {
    // Se já estiver enviando a inscrição ou botão desabilitado, retorna
    if (isBotaoDesabilitado()) return;
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
      'aceitarTermos',
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

    try {
      // Preparar dados para envio incluindo forma de pagamento e valor
      const dadosParaEnvio = {
        ...formData,
        forma_pagamento: formaPagamento,
        valor_inscricao: getValorInscricao()
      };

      console.log('Dados sendo enviados:', dadosParaEnvio); // Para debug

      // ÚNICA REQUISIÇÃO: Enviar a inscrição (que já cria a preferência automaticamente)
      const inscricaoRes = await fetch(`${BACKEND_URL}/inscricoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosParaEnvio),
      });

      if (inscricaoRes.ok) {
        const inscricaoData = await inscricaoRes.json();
        
        console.log('Resposta da inscrição:', inscricaoData); // Para debug
        
        // VERIFICAR SE O INIT_POINT EXISTE E REDIRECIONAR
        if (inscricaoData.init_point) {
          console.log('Redirecionando para:', inscricaoData.init_point);
          // REDIRECIONAMENTO PARA O MERCADO PAGO
          window.location.href = inscricaoData.init_point;
        } else if (inscricaoData.sandbox_init_point) {
          console.log('Redirecionando para sandbox:', inscricaoData.sandbox_init_point);
          // REDIRECIONAMENTO PARA O MERCADO PAGO (SANDBOX)
          window.location.href = inscricaoData.sandbox_init_point;
        } else {
          console.error('init_point não encontrado na resposta:', inscricaoData);
          setError('Erro: URL de pagamento não encontrada. Tente novamente.');
          setIsSubmitting(false);
          return;
        }

        // Mensagem de sucesso (opcional, pois o usuário será redirecionado)
        setMessage("Redirecionando para o pagamento...");

        // Limpar formulário (opcional, pois o usuário será redirecionado)
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
        setCategoriaSelecionada("");
        setVagasRestantes(null);
        setSegundaInscricao(false);
        setFormaPagamento('pix');
        
      } else {
        const errorData = await inscricaoRes.json();
        setError(errorData.message || 'Erro ao salvar inscrição.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      setError('Erro ao conectar com o servidor ou processar a inscrição.');
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
                  <option>XG Masculino</option>
                  <option>PP Feminino</option>
                  <option>P Feminino</option>
                  <option>M Feminino</option>
                  <option>G Feminino</option>
                  <option>GG Feminino</option>
                  <option>XG Feminino</option>
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
                  <option>XG Masculino</option>
                  <option>PP Feminino</option>
                  <option>P Feminino</option>
                  <option>M Feminino</option>
                  <option>G Feminino</option>
                  <option>GG Feminino</option>
                  <option>XG Feminino</option>
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
            <p style={{ color: '#f5d533', fontSize: '14px', marginTop: '5px' }}>
              {formaPagamento === 'pix' 
                ? 'Pagamento via PIX' 
                : 'Pagamento via Cartão de Crédito - Com adicional de taxas admnistrativas'
              }
            </p>
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
                onChange={() => setSegundaInscricao(!segundaInscricao)}
              />
              <label htmlFor="segundaInscricao">
                Segunda inscrição
              </label>
            </div>

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
                <a href="/docs/Termos-e-condicoes-brothers-cup.pdf" target="_blank" rel="noopener noreferrer">
                  Termos e Condições
                </a>{" "}
                e a{" "}
                <a href="/docs/politica-privacidade-brotherscup.pdf" target="_blank" rel="noopener noreferrer">
                  Política de Privacidade
                </a>
              </label>
            </div>
            {camposInvalidos.aceitarTermos && (
              <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                Você deve aceitar os Termos e Condições para continuar.
              </p>
            )}
          </div>

          {/* Mensagens de erro e sucesso */}
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}

          {/* Mensagem de status do botão */}
          {getMensagemStatus() && (
            <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
              {getMensagemStatus()}
            </p>
          )}

          {/* Botão de submissão */}
          <div className="modal-separado">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isBotaoDesabilitado()}
              className={`botao-inscricao ${isSubmitting ? 'botao-carregando' : ''} ${isBotaoDesabilitado() ? 'botao-desabilitado' : ''}`}
            >
              {isSubmitting ? 'Processando...' : 'Finalizar Inscrição'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormularioInscricao;

