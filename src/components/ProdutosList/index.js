import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useProduto } from "../../context/ProdutoContext";
import axios from "axios";
import { FaShoppingCart, FaEye, FaBox, FaWarehouse, FaTimes, FaStore } from "react-icons/fa";
import "./styles.css";

function ProdutosList() {
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { adicionarAoCarrinho, setEmpresaAtual } = useProduto();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para obter a URL da imagem do produto

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
    
    // Se não houver links S3 mas houver base64, usar base64 (último recurso)
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
      
      console.log('🏢 IDs de empresas encontrados nos produtos:', Array.from(empresasIds));
      
      // Se houver apenas uma empresa, buscar seus dados
      if (empresasIds.size === 1) {
        const empresaId = Array.from(empresasIds)[0];
        console.log('🏢 Buscando dados da empresa:', empresaId);
        
        try {
          const empresaResponse = await axios.get(
            `https://back-pdv-production.up.railway.app/usuarios/${empresaId}`
          );
          
          const empresaData = empresaResponse.data;
          console.log('🏢 Empresa encontrada:', empresaData);
          
          // Definir empresa no contexto para o NavBar exibir a logo
          setEmpresaAtual(empresaData);
        } catch (error) {
          console.error('⚠️ Erro ao buscar dados da empresa:', error);
        }
      } else if (empresasIds.size > 1) {
        // Se houver múltiplas empresas, usar a primeira (ou a mais frequente)
        const empresaId = Array.from(empresasIds)[0];
        console.log('🏢 Múltiplas empresas encontradas, usando a primeira:', empresaId);
        
        try {
          const empresaResponse = await axios.get(
            `https://back-pdv-production.up.railway.app/usuarios/${empresaId}`
          );
          
          const empresaData = empresaResponse.data;
          setEmpresaAtual(empresaData);
        } catch (error) {
          console.error('⚠️ Erro ao buscar dados da empresa:', error);
        }
      } else {
        console.log('⚠️ Nenhuma empresa identificada nos produtos');
        // Se não houver empresa identificada, limpar a empresa atual
        setEmpresaAtual(null);
      }
    } catch (error) {
      console.error('⚠️ Erro ao identificar empresa dos produtos:', error);
    }
  };

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get(
          "https://back-pdv-production.up.railway.app/produtos"
        );
        
        console.log("📦 Total de produtos retornados pela API:", response.data.length);
        
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
        
        // A API já filtra produtos baseado no role (clientes veem todos, empresas veem apenas os seus)
        // Se o campo menu existir, filtrar por ele; caso contrário, aceitar todos os produtos retornados
        const produtosEcommerce = response.data.filter(produto => {
          // Se o produto não tem campo menu, aceitar (API já filtrou corretamente)
          if (!produto.menu) return true;
          // Se tem campo menu, aceitar apenas ecommerce ou ambos
          return produto.menu === 'ecommerce' || produto.menu === 'ambos';
        });

        console.log("✅ Produtos após filtro:", produtosEcommerce.length);

        if (produtosEcommerce.length === 0) {
          setNotFound(true);
        } else {
          setProdutos(produtosEcommerce);
          setNotFound(false);
          
          // Identificar a empresa dona dos produtos
          identificarEmpresaDosProdutos(produtosEcommerce);
        }
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchProdutos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const features = [
      {
        icon: <FaBox />,
        text: `${produto.quantidade} em estoque`,
        className: "produto-feature-text"
      },
      {
        icon: <FaWarehouse />,
        text: produto.tipo_produto,
        className: "produto-feature-text"
      }
    ];
    
    // Adicionar nome da empresa se disponível
    if (produto.Empresa?.nome) {
      features.push({
        icon: <FaStore />,
        text: produto.Empresa.nome,
        className: "produto-feature-text"
      });
    }
    
    return features;
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
          <button
            onClick={() => {
              setSearchParams({});
            }}
            className="clear-filter-button"
            title="Limpar filtro"
          >
            <FaTimes />
            Limpar Filtro
          </button>
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

