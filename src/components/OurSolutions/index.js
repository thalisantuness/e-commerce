import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useImovel } from "../../context/ImovelContext";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import "./styles.css";

function OurSolutions() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const { 
    carrinho, 
    adicionarAoCarrinho, 
    calcularQuantidadeTotal 
  } = useImovel();

  useEffect(() => {
    const fetchImoveis = async () => {
      try {
        const response = await axios.get(
          "https://api-corretora-production.up.railway.app/imovel"
        );
        setImoveis(response.data.slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar imóveis:", error);
        setLoading(false);
      }
    };

    fetchImoveis();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAdicionarCarrinho = (e, imovel) => {
    e.preventDefault();
    e.stopPropagation();
    adicionarAoCarrinho(imovel);
    
    // Feedback visual
    const button = e.target.closest('.our-solutions-cart-btn');
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 1000);
    }
  };

  if (loading) {
    return (
      <section className="our-solutions-section">
        <div className="our-solutions-container">
          <div className="our-solutions-header">
            <h2>Nossos Imóveis em Destaque</h2>
            <p>Encontre o imóvel perfeito para você</p>
          </div>
          <div className="our-solutions-loading">
            <div className="our-solutions-spinner"></div>
            <p>Carregando imóveis...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="our-solutions-section">
      <div className="our-solutions-container">
        <div className="our-solutions-header">
          <h2>Nossos Imóveis em Destaque</h2>
          <p>Encontre o imóvel perfeito para você</p>
        </div>

        <div className="our-solutions-grid">
          {imoveis.map((imovel) => (
            <div key={imovel.imovel_id} className="our-solutions-card">
              <Link 
                to={`/detalhes-imovel/${imovel.imovel_id}`}
                className="our-solutions-card-link"
              >
                <div className="our-solutions-image-container">
                  <img 
                    src={imovel.imageData} 
                    alt={imovel.nome}
                    className="our-solutions-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
                    }}
                  />
                  <div className="our-solutions-badge">
                    {imovel.tipo_transacao === 'Aluguel' ? 'Para Alugar' : 'Para Comprar'}
                  </div>
                  
                  {/* Botão rápido de adicionar ao carrinho */}
                  <button 
                    className="our-solutions-quick-cart-btn"
                    onClick={(e) => handleAdicionarCarrinho(e, imovel)}
                    title="Adicionar ao carrinho"
                  >
                    <FaShoppingCart />
                  </button>
                </div>

                <div className="our-solutions-info">
                  <h3 className="our-solutions-title">{imovel.nome}</h3>
                  <p className="our-solutions-description">
                    {imovel.description.length > 100 
                      ? `${imovel.description.substring(0, 100)}...` 
                      : imovel.description
                    }
                  </p>

                  <div className="our-solutions-features">
                    <div className="our-solutions-feature">
                      <span className="our-solutions-feature-icon">🛏️</span>
                      <span>{imovel.n_quartos} quarto{imovel.n_quartos !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="our-solutions-feature">
                      <span className="our-solutions-feature-icon">🚿</span>
                      <span>{imovel.n_banheiros} banheiro{imovel.n_banheiros !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="our-solutions-feature">
                      <span className="our-solutions-feature-icon">🚗</span>
                      <span>{imovel.n_vagas} vaga{imovel.n_vagas !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="our-solutions-location">
                    <span className="our-solutions-location-icon">📍</span>
                    <span>{imovel.cidade.nome}, {imovel.estado.nome}</span>
                  </div>

                  <div className="our-solutions-price">
                    <div className="our-solutions-price-value">
                      <span className="our-solutions-price-number">{formatCurrency(imovel.valor)}</span>
                      {imovel.tipo_transacao === 'Aluguel' && (
                        <span className="our-solutions-price-period">/mês</span>
                      )}
                    </div>
                    {imovel.valor_condominio > 0 && (
                      <div className="our-solutions-condominium">
                        Condomínio: {formatCurrency(imovel.valor_condominio)}/mês
                      </div>
                    )}
                  </div>
                </div>
              </Link>

              {/* Botões de ação */}
              <div className="our-solutions-actions">
                <Link 
                  to={`/detalhes-imovel/${imovel.imovel_id}`}
                  className="our-solutions-details-btn"
                >
                  <FaEye />
                  Ver Detalhes
                </Link>
                <button 
                  className="our-solutions-cart-btn"
                  onClick={(e) => handleAdicionarCarrinho(e, imovel)}
                >
                  <FaShoppingCart />
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="our-solutions-view-all">
          <Link to="/imovel-list" className="our-solutions-view-all-btn">
            Ver Todos os Imóveis
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OurSolutions;