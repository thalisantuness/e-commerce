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
    adicionarAoCarrinho,
    setEmpresaAtual
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
        
        // Identificar a empresa dona dos produtos
        identificarEmpresaDosProdutos(produtosEcommerce);
        
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setLoading(false);
      }
    };

    fetchProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função para identificar e carregar a empresa dos produtos
  const identificarEmpresaDosProdutos = async (produtos) => {
    try {
      // Coletar todos os IDs de empresas dos produtos
      const empresasIds = new Set();
      
      produtos.forEach(produto => {
        // Verificar empresas_autorizadas (pode ser array ou null)
        if (produto.empresas_autorizadas && Array.isArray(produto.empresas_autorizadas)) {
          produto.empresas_autorizadas.forEach(empresaId => {
            if (empresaId) empresasIds.add(empresaId);
          });
        }
        
        // Verificar empresa_id direto (se existir)
        if (produto.empresa_id) {
          empresasIds.add(produto.empresa_id);
        }
      });
      
      // Se houver apenas uma empresa, buscar seus dados
      if (empresasIds.size === 1) {
        const empresaId = Array.from(empresasIds)[0];
        
        try {
          const empresaResponse = await axios.get(
            `https://back-pdv-production.up.railway.app/usuarios/${empresaId}`
          );
          
          const empresaData = empresaResponse.data;
          setEmpresaAtual(empresaData);
        } catch (error) {
          console.error('⚠️ Erro ao buscar dados da empresa:', error);
        }
      } else if (empresasIds.size > 1) {
        // Se houver múltiplas empresas, usar a primeira
        const empresaId = Array.from(empresasIds)[0];
        
        try {
          const empresaResponse = await axios.get(
            `https://back-pdv-production.up.railway.app/usuarios/${empresaId}`
          );
          
          const empresaData = empresaResponse.data;
          setEmpresaAtual(empresaData);
        } catch (error) {
          console.error('⚠️ Erro ao buscar dados da empresa:', error);
        }
      }
    } catch (error) {
      console.error('⚠️ Erro ao identificar empresa dos produtos:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter a URL da imagem do produto
  // Prioriza links S3 sobre base64 (que é muito pesado para listagens)
  const getImageUrl = (produto) => {
    if (!produto) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGQUZCIi8+CjxwYXRoIGQ9Ik0xNTAgNzBDMTYzLjYgNzAgMTc1IDgxLjQgMTc1IDk1QzE3NSAxMDguNiAxNjMuNiAxMjAgMTUwIDEyMEMxMzYuNCAxMjAgMTI1IDEwOC42IDEyNSA5NUMxMjUgODEuNCAxMzYuNCA3MCAxNTAgNzBaIiBmaWxsPSIjQ0JENUUwIi8+CjxwYXRoIGQ9Ik03NSAxNTBDNzUgMTQ3Ljc5MSA3Ny43OTAyIDE0NSA4MSAxNDVIMTE5QzEyMi4yMDk4IDE0NSAxMjUgMTQ3Ljc5MSAxMjUgMTUwVjE3MEMxMjUgMTcyLjIwOTggMTIyLjIwOTggMTc1IDExOSAxNzVIODFDNzcuNzkwMiAxNzUgNzUgMTcyLjIwOTggNzUgMTcwVjE1MFoiIGZpbGw9IiNDQkQ1RTAiLz4KPC9zdmc+';
    }
    
    // Coletar todas as possíveis URLs
    const imageFields = [
      produto.foto_principal,
      produto.url_imagem,
      produto.image,
      produto.imageData
    ].filter(Boolean); // Remove valores falsy
    
    // Priorizar links HTTP/HTTPS (S3) sobre base64
    const s3Links = imageFields.filter(url => 
      typeof url === 'string' && 
      (url.startsWith('http://') || url.startsWith('https://'))
    );
    
    // Se houver links S3, usar o primeiro
    if (s3Links.length > 0) {
      return s3Links[0];
    }
    
    // Se não houver links S3 mas houver base64, usar placeholder (base64 é muito pesado)
    const base64Images = imageFields.filter(url => 
      typeof url === 'string' && 
      url.startsWith('data:image')
    );
    
    if (base64Images.length > 0) {
      // Base64 é muito pesado para listagens - usar placeholder
      console.warn('⚠️ Produto', produto.nome, 'retornou base64 ao invés de link S3. Usando placeholder.');
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGQUZCIi8+CjxwYXRoIGQ9Ik0xNTAgNzBDMTYzLjYgNzAgMTc1IDgxLjQgMTc1IDk1QzE3NSAxMDguNiAxNjMuNiAxMjAgMTUwIDEyMEMxMzYuNCAxMjAgMTI1IDEwOC42IDEyNSA5NUMxMjUgODEuNCAxMzYuNCA3MCAxNTAgNzBaIiBmaWxsPSIjQ0JENUUwIi8+CjxwYXRoIGQ9Ik03NSAxNTBDNzUgMTQ3Ljc5MSA3Ny43OTAyIDE0NSA4MSAxNDVIMTE5QzEyMi4yMDk4IDE0NSAxMjUgMTQ3Ljc5MSAxMjUgMTUwVjE3MEMxMjUgMTcyLjIwOTggMTIyLjIwOTggMTc1IDExOSAxNzVIODFDNzcuNzkwMiAxNzUgNzUgMTcyLjIwOTggNzUgMTcwVjE1MFoiIGZpbGw9IiNDQkQ1RTAiLz4KPC9zdmc+';
    }
    
    // Nenhuma imagem encontrada
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGQUZCIi8+CjxwYXRoIGQ9Ik0xNTAgNzBDMTYzLjYgNzAgMTc1IDgxLjQgMTc1IDk1QzE3NSAxMDguNiAxNjMuNiAxMjAgMTUwIDEyMEMxMzYuNCAxMjAgMTI1IDEwOC42IDEyNSA5NUMxMjUgODEuNCAxMzYuNCA3MCAxNTAgNzBaIiBmaWxsPSIjQ0JENUUwIi8+CjxwYXRoIGQ9Ik03NSAxNTBDNzUgMTQ3Ljc5MSA3Ny43OTAyIDE0NSA4MSAxNDVIMTE5QzEyMi4yMDk4IDE0NSAxMjUgMTQ3Ljc5MSAxMjUgMTUwVjE3MEMxMjUgMTcyLjIwOTggMTIyLjIwOTggMTc1IDExOSAxNzVIODFDNzcuNzkwMiAxNzUgNzUgMTcyLjIwOTggNzUgMTcwVjE1MFoiIGZpbGw9IiNDQkQ1RTAiLz4KPC9zdmc+';
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