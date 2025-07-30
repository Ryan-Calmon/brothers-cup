import React, { useState } from 'react';
import './VagasPorCategoria.css';

const VagasPorCategoria = ({ inscricoes, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Capacidades máximas por categoria
  const capacidadesPorCategoria = {
    'Escolinha': 24,
    'Misto Escolinha': 24,
    'Feminino Iniciante': 16,
    'Masculino Iniciante': 16,
    'Masculino Intermediário': 16,
    'Misto Iniciante': 16,
    'Misto Intermediário': 16,
    'Open': 16
  };

  // Função para calcular estatísticas por categoria
  const calcularEstatisticasPorCategoria = () => {
    const estatisticas = {};
    
    inscricoes.forEach(inscricao => {
      const categoria = inscricao.categoria;
      const isPago = inscricao.status_pagamento === 'approved';
      
      if (!estatisticas[categoria]) {
        estatisticas[categoria] = {
          total: 0,
          pagas: 0
        };
      }
      
      estatisticas[categoria].total += 1;
      if (isPago) {
        estatisticas[categoria].pagas += 1;
      }
    });
    
    return estatisticas;
  };

  // Função para calcular totais gerais
  const calcularTotaisGerais = () => {
    const totalInscricoes = inscricoes.length;
    const totalPagas = inscricoes.filter(i => i.status_pagamento === 'approved').length;
    
    return {
      total: totalInscricoes,
      pagas: totalPagas
    };
  };

  const estatisticas = calcularEstatisticasPorCategoria();
  const totaisGerais = calcularTotaisGerais();

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Botão para abrir o modal */}
      <button 
        className="vagas-categoria-button" 
        onClick={handleToggleVisibility}
        title="Ver estatísticas por categoria"
      >
        📊 Vagas por Categoria
      </button>

      {/* Modal com as estatísticas */}
      {isVisible && (
        <div className="vagas-categoria-modal-overlay" onClick={handleClose}>
          <div className="vagas-categoria-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vagas-categoria-header">
              <h2>📊 Vagas por Categoria</h2>
              <button className="close-button" onClick={handleClose}>
                ✕
              </button>
            </div>
            
            <div className="vagas-categoria-content">
              {Object.keys(estatisticas).length === 0 ? (
                <div className="no-data">
                  <p>📭 Nenhuma inscrição encontrada</p>
                </div>
              ) : (
                <>
                  {/* Lista de categorias */}
                  <div className="categorias-list">
                    {Object.entries(estatisticas)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([categoria, dados]) => {
                        // Encontrar o máximo de inscrições entre todas as categorias para calcular a porcentagem
                        const maxInscricoes = Math.max(...Object.values(estatisticas).map(cat => cat.total));
                        const porcentagemInscricoes = maxInscricoes > 0 ? (dados.total / maxInscricoes) * 100 : 0;
                        
                        return (
                          <div key={categoria} className="categoria-item">
                            <div className="categoria-header">
                              <h3 className="categoria-nome">{categoria}</h3>
                              <div className="categoria-numeros">
                                <span className="total-duplas">
                                  Total: <strong>{dados.total}</strong>
                                </span>
                                <span className="duplas-pagas">
                                  Pagas: <strong>{dados.pagas}</strong>
                                </span>
                              </div>
                            </div>
                            
                            <div className="progress-container">
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ width: `${porcentagemInscricoes}%` }}
                                ></div>
                              </div>
                              <span className="progress-text">
                                {dados.total} duplas
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Totais gerais */}
                  <div className="totais-gerais">
                    <h3>📈 Totais Gerais</h3>
                    <div className="totais-container">
                      <div className="total-item">
                        <span className="total-label">Total de Vagas Inscritas:</span>
                        <span className="total-value">{totaisGerais.total}</span>
                      </div>
                      <div className="total-item">
                        <span className="total-label">Total de Vagas Pagas:</span>
                        <span className="total-value total-pagas">{totaisGerais.pagas}</span>
                      </div>
                      <div className="total-item">
                        <span className="total-label">Percentual Pago:</span>
                        <span className="total-value">
                          {totaisGerais.total > 0 ? ((totaisGerais.pagas / totaisGerais.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VagasPorCategoria;

