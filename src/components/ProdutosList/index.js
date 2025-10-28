import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProduto } from "../../context/ProdutoContext";
import axios from "axios";
import { FaShoppingCart, FaEye, FaBox, FaTag, FaWarehouse } from "react-icons/fa";
import "./styles.css";

function ProdutosList() {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { adicionarAoCarrinho } = useProduto();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get(
          "https://back-pdv-production.up.railway.app/produtos"
        );
        
        // Debug: ver estrutura dos produtos
        if (response.data.length > 0) {
          console.log("🔍 Estrutura do primeiro produto:", response.data[0]);
          console.log("🏢 Empresa ID do produto:", response.data[0].empresa_id);
          console.log("📸 Campos de imagem disponíveis:", {
            foto_principal: response.data[0].foto_principal,
            imageData: response.data[0].imageData,
            image: response.data[0].image,
            url_imagem: response.data[0].url_imagem
          });
        }
        
        // Filtrar apenas produtos do e-commerce
        const produtosEcommerce = response.data.filter(produto => 
          produto.menu === 'ecommerce' || produto.menu === 'ambos'
        );

        if (produtosEcommerce.length === 0) {
          setNotFound(true);
        } else {
          setProdutos(produtosEcommerce);
          setNotFound(false);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  // Efeito para filtrar produtos com base na busca
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    
    if (searchTerm && produtos.length > 0) {
      const termoLower = searchTerm.toLowerCase();
      const filtrados = produtos.filter(produto => 
        produto.nome.toLowerCase().includes(termoLower) ||
        produto.tipo_produto?.toLowerCase().includes(termoLower) ||
        produto.tipo_comercializacao?.toLowerCase().includes(termoLower)
      );
      
      setProdutosFiltrados(filtrados);
      setNotFound(filtrados.length === 0);
    } else {
      setProdutosFiltrados(produtos);
      setNotFound(produtos.length === 0);
    }
  }, [searchParams, produtos]);

  const handleAdicionarCarrinho = (e, produto) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Debug: verificar se empresa_id está presente
    console.log("🛒 Adicionando ao carrinho:", {
      produto_id: produto.produto_id,
      nome: produto.nome,
      empresa_id: produto.empresa_id,
      tem_empresa_id: !!produto.empresa_id
    });
    
    adicionarAoCarrinho(produto);
    
    // Feedback visual
    const button = e.target.closest('.produto-cart-btn');
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 1000);
    }
  };

  const handleSelectProduto = (id) => {
    navigate(`/detalhes-produto/${id}`);
  };

  const getProductFeatures = (produto) => {
    return [
      {
        icon: <FaBox />,
        text: `${produto.quantidade} em estoque`,
        className: "produto-feature-text"
      },
      {
        icon: <FaTag />,
        text: produto.tipo_comercializacao,
        className: "produto-feature-text"
      },
      {
        icon: <FaWarehouse />,
        text: produto.tipo_produto,
        className: "produto-feature-text"
      }
    ];
  };

  if (loading) {
    return (
      <div className="produtos-list-container">
        <div className="produtos-loading">
          <div className="produtos-spinner"></div>
          <p>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    const searchTerm = searchParams.get('search');
    return (
      <div className="produtos-list-container">
        <div className="not-found-message">
          <h3>Nenhum produto encontrado</h3>
          <p>
            {searchTerm 
              ? `Não foram encontrados produtos com o termo "${searchTerm}"`
              : "Não há produtos disponíveis no momento"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="produtos-list-container">
      {searchParams.get('search') && (
        <div className="search-results-info">
          <p>
            Mostrando {produtosFiltrados.length} resultado(s) para "{searchParams.get('search')}"
          </p>
        </div>
      )}
      <div className="produtos-grid">
        {produtosFiltrados.map((produto) => (
          <div
            key={produto.produto_id}
            className="produto-card"
          >
            <div className="produto-image-container">
              <img
                src={getImageUrl(produto)}
                alt={produto.nome}
                className="produto-image"
                onClick={() => handleSelectProduto(produto.produto_id)}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Imagem+Indisponível';
                }}
              />
              <div className="produto-badge">
                {produto.tipo_comercializacao === 'Venda' ? 'À Venda' : 'Em Promoção'}
              </div>
              
              <button 
                className="produto-quick-cart-btn"
                onClick={(e) => handleAdicionarCarrinho(e, produto)}
                title="Adicionar ao carrinho"
              >
                <FaShoppingCart />
              </button>
            </div>

            <div className="produto-info">
              <h3 
                className="produto-title"
                onClick={() => handleSelectProduto(produto.produto_id)}
              >
                {produto.nome}
              </h3>
              
              <div className="produto-features">
                {getProductFeatures(produto).map((feature, index) => (
                  <div key={index} className="produto-feature">
                    <span className="produto-feature-icon">{feature.icon}</span>
                    <span className={feature.className}>{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="produto-price">
                <div className="produto-price-value">
                  <span className="produto-price-number">
                    {formatCurrency(produto.valor)}
                  </span>
                </div>
              </div>
            </div>

            <div className="produto-actions">
              <button 
                onClick={() => handleSelectProduto(produto.produto_id)}
                className="produto-details-btn"
              >
                <FaEye />
                Ver Detalhes
              </button>
              <button 
                className="produto-cart-btn"
                onClick={(e) => handleAdicionarCarrinho(e, produto)}
              >
                <FaShoppingCart />
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProdutosList;

