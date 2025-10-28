import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useProduto } from "../../context/ProdutoContext";
import { FaShoppingCart, FaEye, FaBox, FaTag, FaWarehouse } from "react-icons/fa";
import "./styles.css";

function HomeProducts() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { 
    adicionarAoCarrinho 
  } = useProduto();

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get(
          "https://back-pdv-production.up.railway.app/produtos"
        );
        
        // Filtrar apenas produtos do e-commerce
        const produtosEcommerce = response.data.filter(produto => 
          produto.menu === 'ecommerce' || produto.menu === 'ambos'
        );
        
        setProdutos(produtosEcommerce.slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter a URL da imagem do produto
  const getImageUrl = (produto) => {
    // Tenta diferentes campos possíveis para a imagem
    return produto.foto_principal || 
           produto.imageData || 
           produto.image || 
           produto.url_imagem || 
           'https://via.placeholder.com/300x200?text=Sem+Imagem';
  };

  const handleAdicionarCarrinho = (e, produto) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Debug: verificar se empresa_id está presente
    console.log("🛒 Adicionando ao carrinho (Home):", {
      produto_id: produto.produto_id,
      nome: produto.nome,
      empresa_id: produto.empresa_id,
      tem_empresa_id: !!produto.empresa_id
    });
    
    adicionarAoCarrinho(produto);
    
    // Feedback visual
    const button = e.target.closest('.our-solutions-cart-btn');
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 1000);
    }
  };

  const getProductFeatures = (produto) => {
    return [
      {
        icon: <FaBox />,
        text: `${produto.quantidade} em estoque`,
        className: "our-solutions-feature-text-black"
      },
      {
        icon: <FaTag />,
        text: produto.tipo_comercializacao,
        className: "our-solutions-feature-text-black"
      },
      {
        icon: <FaWarehouse />,
        text: produto.tipo_produto,
        className: "our-solutions-feature-text-black"
      }
    ];
  };

  if (loading) {
    return (
      <section className="our-solutions-section">
        <div className="our-solutions-container">
          <div className="our-solutions-header">
            <h2>Nossos Produtos em Destaque</h2>
            <p>Encontre os melhores produtos para você</p>
          </div>
          <div className="our-solutions-loading">
            <div className="our-solutions-spinner"></div>
            <p>Carregando produtos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="our-solutions-section">
      <div className="our-solutions-container">
        <div className="our-solutions-header">
          <h2>Nossos Produtos em Destaque</h2>
          <p>Encontre os melhores produtos para você</p>
        </div>

        <div className="our-solutions-grid">
          {produtos.map((produto) => (
            <div key={produto.produto_id} className="our-solutions-card">
              <Link 
                to={`/detalhes-produto/${produto.produto_id}`}
                className="our-solutions-card-link"
              >
                <div className="our-solutions-image-container">
                  <img 
                    src={getImageUrl(produto)} 
                    alt={produto.nome}
                    className="our-solutions-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
                    }}
                  />
                  <div className="our-solutions-badge">
                    {produto.tipo_comercializacao === 'Venda' ? 'À Venda' : 'Em Promoção'}
                  </div>
                  
                  <button 
                    className="our-solutions-quick-cart-btn"
                    onClick={(e) => handleAdicionarCarrinho(e, produto)}
                    title="Adicionar ao carrinho"
                  >
                    <FaShoppingCart />
                  </button>
                </div>

                <div className="our-solutions-info">
                  {/* NOME EM PRETO */}
                  <h3 className="our-solutions-title our-solutions-text-black">
                    {produto.nome}
                  </h3>
                  
                  <div className="our-solutions-features">
                    {getProductFeatures(produto).map((feature, index) => (
                      <div key={index} className="our-solutions-feature">
                        <span className="our-solutions-feature-icon">{feature.icon}</span>
                        <span className={feature.className}>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                 

                  {/* VALOR EM PRETO (mantendo a cor original do preço) */}
                  <div className="our-solutions-price">
                    <div className="our-solutions-price-value">
                      <span className="our-solutions-price-number our-solutions-text-black">
                        {formatCurrency(produto.valor)}
                      </span>
                    </div>
                    {/* REMOVIDO: valor_custo */}
                  </div>
                </div>
              </Link>

              <div className="our-solutions-actions">
                <Link 
                  to={`/detalhes-produto/${produto.produto_id}`}
                  className="our-solutions-details-btn"
                >
                  <FaEye />
                  Ver Detalhes
                </Link>
                <button 
                  className="our-solutions-cart-btn"
                  onClick={(e) => handleAdicionarCarrinho(e, produto)}
                >
                  <FaShoppingCart />
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="our-solutions-view-all">
          <Link to="/produto-list" className="our-solutions-view-all-btn">
            Ver Todos os Produtos
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeProducts;