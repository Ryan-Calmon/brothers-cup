import React, { useState } from 'react';
import { FaTrophy } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { IoShirt } from "react-icons/io5";
import { CiInstagram } from "react-icons/ci";
import { MdOutlineStadium } from "react-icons/md";
import "../styles/formularioinscricao.css";

function FormularioInscricao() {
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
    segundaInscricao: false,
  });

  const [camposInvalidos, setCamposInvalidos] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // Mensagem adicional

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
      'categoria'
    ];

    const novosInvalidos = {};

    camposObrigatorios.forEach((campo) => {
      if (!formData[campo] || formData[campo] === 'Categoria' || formData[campo] === 'Selecione o tamanho') {
        novosInvalidos[campo] = true;
      }
    });

    setCamposInvalidos(novosInvalidos);

    if (Object.keys(novosInvalidos).length > 0) {
      setError('Por favor, preencha todos os campos obrigatórios.');
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
          parceiro: '',
          instagramRepresentante: '',
          instagramParceiro: '',
          uniformeRepresentante: '',
          uniformeParceiro: '',
          categoria: '',
          ctRepresentante: '',
          ctParceiro: '',
          segundaInscricao: false,
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
          </div>

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

          <div className='modal-separado'>
            <div className='row'>
              <p className='titulo-inscricao'>Categoria</p>
              <select
                className={`input ${camposInvalidos.categoria ? 'input-invalido' : ''}`}
                name="categoria"
                value={formData.categoria}
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
            </div>
          </div>

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

          {/* Exibir mensagem quando a segunda inscrição for marcada */}
          {formData.segundaInscricao && (
            <p style={{ color: 'red', marginTop: '10px' }}>
              Para segunda inscrição, por favor, nos mande um direct.
            </p>
          )}

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          {/* Desabilitar o botão quando "segundaInscricao" for verdadeiro */}
          <button
            className='botao-inscricao'
            onClick={handleSubmit}
            disabled={formData.segundaInscricao}  // Botão desativado
          >
            Inscrever-se
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormularioInscricao;
