import React from 'react';
import { FaTrophy } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { IoShirt } from "react-icons/io5";
import "../styles/formularioinscricao.css";
import { CiInstagram } from "react-icons/ci";

function FormularioInscricao(){
  return(
    <div class="d-flex justify-content-center">
    <div className='container-inscricao'>
      <div className='formulario-de-inscricao'>
        <FaTrophy />
      <p className='inscricao'> Formulário de Inscrição  </p>
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
           <input type="text" placeholder="Nome do Representante *" className="input" />
           </div>
             <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> Nome do Parceiro </p> 
          <input type="text" placeholder="Nome do Parceiro *" className="input" />
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
           <input type="text" placeholder="@ do Representante *" className="input" />
           </div>
             <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> @ do Parceiro </p> 
          <input type="text" placeholder="@ do Parceiro *" className="input" />
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
            <select className="input">
            <option>Selecione o tamanho</option>
            <option>P</option>
            <option>M</option>
            <option>G</option>
            <option>GG</option>
          </select>
           </div>
             <div className='col-12 col-md-6'>
                <p className='sobre-inscricao'> Tamanho - Parceiro </p> 
           <select className="input">
            <option>Selecione o tamanho</option>
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
         <select className="input">
            <option>Categoria</option>
            <option>Open</option>
            <option>Misto</option>
            <option>Escolinha</option>
            <option>Iniciante</option>
            </select>
      </div>
      </div>
      <button className='botao-inscricao'>Inscrever-se</button>
      </div>  
    </div>
    </div>
  );



}
export default FormularioInscricao