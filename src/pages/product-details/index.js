import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaBox, FaTag, FaWarehouse, FaShoppingCart, FaWhatsapp } from "react-icons/fa";
import { useProduto } from "../../context/ProdutoContext";
import "./style.css";

function ProductListDetails() {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantidade, setQuantidade] = useState(1);
  const [fotoAtual, setFotoAtual] = useState(null);
  const [fotosSecundarias, setFotosSecundarias] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [mensagemCustomizacao, setMensagemCustomizacao] = useState('');
  const navigate = useNavigate();
  const { adicionarAoCarrinho, setEmpresaAtual } = useProduto();

  // Data URI para placeholder - não faz requisição HTTP
  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjhGQUZCIi8+CjxwYXRoIGQ9Ik0zMDAgMTgwQzMyNy42IDE4MCAzNTAgMjAyLjQgMzUwIDIzMEMzNTAgMjU3LjYgMzI3LjYgMjgwIDMwMCAyODBDMjcyLjQgMjgwIDI1MCAyNTcuNiAyNTAgMjMwQzI1MCAyMDIuNCAyNzIuNCAxODAgMzAwIDE4MFoiIGZpbGw9IiNDQkQ1RTAiLz4KPHA+dGggIGQ9Ik0yMDAgMzIwQzIwMCAzMTcuNzkxIDIwMi43OTEgMzE2IDIwNiAzMTZINDRDNDc3LjIwOTggMzE2IDUwMCAzMTcuNzkxIDUwMCAzMjBWNDAwQzUwMCA0MDIuMjA5OCA0NzcuMjA5OCA0MDQgNDQ0IDQwNEgyMDZDMjAyLjc5MDIgNDA0IDIwMCA0MDIuMjA5OCAyMDAgNDAwVjMyMFoiIGZpbGw9IiNDQkQ1RTAiLz4KPC9zdmc+';
  };

  // Função para obter a URL da imagem do produto
  // Prioriza links S3 sobre base64
  const getImageUrl = (produto) => {
    if (!produto) return getPlaceholderImage();
    
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
    
    // Se não houver links S3 mas houver base64, usar base64 (aceita em detalhes)
    const base64Images = imageFields.filter(url => 
      typeof url === 'string' && 
      url.startsWith('data:image')
    );
    
    if (base64Images.length > 0) {
      // Em detalhes, aceita base64 (mas prefere S3)
      console.warn('⚠️ Produto', produto.nome, 'retornou base64. Backend deveria retornar link S3.');
      return base64Images[0];
    }
    
    // Nenhuma imagem encontrada
    return getPlaceholderImage();
  };

  useEffect(() => {
    // Função auxiliar dentro do useEffect para evitar warning de dependência
    const getImageUrlForFetch = (produto) => {
      if (!produto) return getPlaceholderImage();
      
      // Coletar todas as possíveis URLs
      const imageFields = [
        produto.foto_principal,
        produto.url_imagem,
        produto.image,
        produto.imageData
      ].filter(Boolean);
      
      // Priorizar links HTTP/HTTPS (S3) sobre base64
      const s3Links = imageFields.filter(url => 
        typeof url === 'string' && 
        (url.startsWith('http://') || url.startsWith('https://'))
      );
      
      if (s3Links.length > 0) {
        return s3Links[0];
      }
      
      const base64Images = imageFields.filter(url => 
        typeof url === 'string' && 
        url.startsWith('data:image')
      );
      
      if (base64Images.length > 0) {
        return base64Images[0];
      }
      
      return getPlaceholderImage();
    };

    const fetchProduto = async () => {
      try {
        if (id) {
          const response = await axios.get(
            `https://back-pdv-production.up.railway.app/produtos/${id}`
          );
          const produtoData = response.data;
          setProduto(produtoData);
          
          // Configurar foto principal (só se não for placeholder)
          const fotoPrincipal = getImageUrlForFetch(produtoData);
          // Se a foto principal for um placeholder, não definir como atual (deixar null para usar fallback)
          if (fotoPrincipal && !fotoPrincipal.includes('placeholder.com') && !fotoPrincipal.startsWith('data:')) {
            setFotoAtual(fotoPrincipal);
          } else {
            // Se só tiver placeholder, usar ele mesmo
            setFotoAtual(fotoPrincipal);
          }
          
          // Buscar fotos secundárias (se existirem)
          const fotos = [];
          
          // Verificar se há fotos secundárias em diferentes campos
          if (produtoData.fotos && Array.isArray(produtoData.fotos)) {
            produtoData.fotos.forEach(foto => {
              const photoUrl = foto?.imageData || foto?.url_imagem || foto?.url || foto;
              // Só adicionar se for uma URL válida (não placeholder e diferente da principal)
              if (photoUrl && 
                  typeof photoUrl === 'string' && 
                  photoUrl !== fotoPrincipal && 
                  (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) &&
                  !photoUrl.includes('placeholder.com') &&
                  !fotos.includes(photoUrl)) {
                fotos.push(photoUrl);
              }
            });
          }
          
          // Verificar outros campos possíveis para fotos secundárias
          if (produtoData.fotos_secundarias && Array.isArray(produtoData.fotos_secundarias)) {
            produtoData.fotos_secundarias.forEach(foto => {
              const photoUrl = foto?.imageData || foto?.url_imagem || foto?.url || foto;
              if (photoUrl && 
                  typeof photoUrl === 'string' && 
                  photoUrl !== fotoPrincipal && 
                  (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) &&
                  !photoUrl.includes('placeholder.com') &&
                  !fotos.includes(photoUrl)) {
                fotos.push(photoUrl);
              }
            });
          }
          
          // Verificar campo photos primeiro (formato mais comum: array com photo_id e imageData)
          if (produtoData.photos && Array.isArray(produtoData.photos)) {
            produtoData.photos.forEach(photo => {
              // Priorizar imageData (formato usado pela API)
              const photoUrl = photo?.imageData || photo?.url_imagem || photo?.url || photo;
              if (photoUrl && 
                  typeof photoUrl === 'string' && 
                  photoUrl !== fotoPrincipal && 
                  (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) &&
                  !photoUrl.includes('placeholder.com') &&
                  !fotos.includes(photoUrl)) {
                fotos.push(photoUrl);
                console.log('📸 Foto secundária encontrada:', photoUrl);
              }
            });
          }
          
          console.log('📸 Total de fotos secundárias encontradas:', fotos.length);
          if (fotos.length > 0) {
            console.log('📸 URLs das fotos secundárias:', fotos);
          }
          setFotosSecundarias(fotos);
          
          // Buscar dados da empresa se houver empresa_id ou objeto Empresa
          // Primeiro, tentar usar empresa_id direto
          let empresaId = produtoData.empresa_id || produtoData.Empresa?.empresa_id || produtoData.Empresa?.usuario_id;
          
          // Se não tiver empresa_id, usar a primeira empresa autorizada
          if (!empresaId && produtoData.empresas_autorizadas && Array.isArray(produtoData.empresas_autorizadas) && produtoData.empresas_autorizadas.length > 0) {
            empresaId = produtoData.empresas_autorizadas[0];
            console.log('🏢 Usando primeira empresa autorizada:', empresaId);
          }
          
          if (empresaId) {
            try {
              const empresaResponse = await axios.get(
                `https://back-pdv-production.up.railway.app/usuarios/${empresaId}`
              );
              setEmpresa(empresaResponse.data);
              setEmpresaAtual(empresaResponse.data); // Atualizar empresa no contexto para o NavBar
              console.log('🏢 Empresa encontrada:', empresaResponse.data);
            } catch (empresaError) {
              console.warn('⚠️ Erro ao buscar dados da empresa:', empresaError);
              // Se não conseguir buscar, verificar se vem no produto
              if (produtoData.Empresa) {
                setEmpresa(produtoData.Empresa);
                setEmpresaAtual(produtoData.Empresa); // Atualizar empresa no contexto para o NavBar
              }
            }
          } else if (produtoData.Empresa) {
            // Se a empresa já vier no produto
            setEmpresa(produtoData.Empresa);
            setEmpresaAtual(produtoData.Empresa); // Atualizar empresa no contexto para o NavBar
            console.log('🏢 Empresa veio no produto:', produtoData.Empresa);
          } else {
            console.warn('⚠️ Nenhuma informação de empresa encontrada para o produto');
          }
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [id, setEmpresaAtual]);
  
  // Garantir que a empresa não seja limpa enquanto estiver nesta página
  useEffect(() => {
    // Se a empresa foi definida, garantir que permaneça enquanto estiver nesta página
    if (empresa) {
      setEmpresaAtual(empresa);
    }
  }, [empresa, setEmpresaAtual]);
  
  // Atualizar título e favicon quando empresa ou produto mudar
  useEffect(() => {
    if (empresa || produto) {
      const empresaNome = empresa?.nome || empresa?.razao_social || empresa?.nome_fantasia || '';
      const produtoNome = produto?.nome || '';
      
      let titulo;
      if (empresaNome && produtoNome) {
        titulo = `${produtoNome} - ${empresaNome}`;
      } else if (empresaNome) {
        titulo = empresaNome;
      } else if (produtoNome) {
        titulo = produtoNome;
      } else {
        titulo = 'Detalhes do Produto';
      }
      
      // Atualizar título da página
      document.title = titulo;
      console.log('📝 Título da página atualizado:', titulo);
      
      // Atualizar favicon com logo da empresa
      if (empresa) {
        const logoEmpresa = empresa.logo || 
                           empresa.logo_url ||
                           empresa.foto_perfil || 
                           empresa.foto_principal ||
                           empresa.imageData ||
                           empresa.url_logo;
        
        if (logoEmpresa && (logoEmpresa.startsWith('http://') || logoEmpresa.startsWith('https://'))) {
          // Remover favicons antigos
          const existingFavicons = document.querySelectorAll('link[rel="icon"]');
          existingFavicons.forEach(fav => fav.remove());
          
          // Criar novo favicon
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/png';
          link.href = logoEmpresa;
          document.head.appendChild(link);
          
          console.log('✅ Favicon atualizado com logo da empresa:', logoEmpresa);
        } else if (logoEmpresa) {
          console.warn('⚠️ Logo da empresa não é uma URL válida:', logoEmpresa);
        }
      }
      
      // Cleanup: restaurar título e favicon originais quando sair da página
      return () => {
        document.title = 'E-commerce';
        // Restaurar favicon padrão
        const existingFavicons = document.querySelectorAll('link[rel="icon"]');
        existingFavicons.forEach(fav => {
          if (!fav.href.includes('seu-favicon.png') && !fav.href.includes('favicon-32x32.png') && !fav.href.includes('favicon-64x64.png')) {
            fav.remove();
          }
        });
      };
    }
  }, [empresa, produto]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleAdicionarCarrinho = () => {
    if (produto) {
      const mensagem = mensagemCustomizacao.trim() || null;
      for (let i = 0; i < quantidade; i++) {
        adicionarAoCarrinho(produto, mensagem);
      }
      // Feedback visual
      alert(`${quantidade} ${quantidade === 1 ? 'produto adicionado' : 'produtos adicionados'} ao carrinho!`);
      // Limpar mensagem após adicionar
      setMensagemCustomizacao('');
    }
  };

  const handleQuantidadeChange = (tipo) => {
    if (tipo === 'incrementar' && quantidade < produto.quantidade) {
      setQuantidade(quantidade + 1);
    } else if (tipo === 'decrementar' && quantidade > 1) {
      setQuantidade(quantidade - 1);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando detalhes do produto...</p>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="loading-container">
        <p>Produto não encontrado</p>
        <button onClick={handleBack} className="back-button">
          <IoIosArrowBack className="back-icon" />
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <NavBar />
      
      <div className="product-details-container">
        <button onClick={handleBack} className="back-button">
          <IoIosArrowBack className="back-icon" />
          Voltar para lista
        </button>
        
        <div className="product-content-wrapper">
          <div className="product-media-section">
            <div className="carousel-container">
              <div className="main-carousel">
                <div className="slide-container">
                  <img 
                    src={fotoAtual || getImageUrl(produto)} 
                    alt={produto.nome}
                    className="active-slide"
                    loading="lazy"
                    onError={(e) => {
                      // Prevenir loop infinito de requisições
                      if (e.target.dataset.errorHandled) return;
                      e.target.dataset.errorHandled = 'true';
                      e.target.src = getPlaceholderImage();
                    }}
                  />
                </div>
              </div>
              
              {/* Fotos secundárias abaixo da foto principal */}
              {fotosSecundarias.length > 0 && (
                <div className="secondary-photos-container">
                  <h3 className="secondary-photos-title">Outras Fotos</h3>
                  <div className="secondary-photos-grid">
                    {fotosSecundarias.map((foto, index) => (
                      <div
                        key={index}
                        className={`secondary-photo ${fotoAtual === foto ? 'active' : ''}`}
                        onClick={() => setFotoAtual(foto)}
                      >
                        <img
                          src={foto}
                          alt={`${produto.nome} - Foto ${index + 2}`}
                          loading="lazy"
                          onError={(e) => {
                            // Prevenir loop infinito de requisições
                            if (e.target.dataset.errorHandled) return;
                            e.target.dataset.errorHandled = 'true';
                            // Data URI para placeholder menor (150x100)
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjhGQUZCIi8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZDMTAwIDY0LjI4NDMgODMuMjg0MyA3MSA3NSA3MUM2Ni43MTU3IDcxIDYwIDY0LjI4NDMgNjAgNTZDNjAgNDcuNzE1NyA2Ni43MTU3IDQxIDc1IDQxWiIgZmlsbD0iI0NCRDVFRSIvPgo8cGF0aCBkPSJNNTAgODBDNTAgNzguNzkwMiA1Mi43OTAyIDc3IDU2IDc3SDk0Qzk3LjIwOTggNzcgMTAwIDc4Ljc5MDIgMTAwIDgwVjkyQzEwMCA5NC4yMDk4IDk3LjIwOTggOTYgOTQgOTZINTZDNTIuNzkwMiA5NiA1MCA5NC4yMDk4IDUwIDkyVjgwWiIgZmlsbD0iI0NCRDVFRSIvPgo8L3N2Zz4=';
                          }}
                        />
                      </div>
                    ))}
                    {/* Incluir foto principal nas secundárias também (exceto se já estiver lá) */}
                    {produto && !fotosSecundarias.includes(getImageUrl(produto)) && (
                      <div
                        className={`secondary-photo ${fotoAtual === getImageUrl(produto) ? 'active' : ''}`}
                        onClick={() => setFotoAtual(getImageUrl(produto))}
                      >
                        <img
                          src={getImageUrl(produto)}
                          alt={`${produto.nome} - Foto Principal`}
                          loading="lazy"
                          onError={(e) => {
                            // Prevenir loop infinito de requisições
                            if (e.target.dataset.errorHandled) return;
                            e.target.dataset.errorHandled = 'true';
                            // Data URI para placeholder menor (150x100)
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjhGQUZCIi8+CjxwYXRoIGQ9Ik03NSA0MUM4My4yODQzIDQxIDkwIDQ3LjcxNTcgOTAgNTZDMTAwIDY0LjI4NDMgODMuMjg0MyA3MSA3NSA3MUM2Ni43MTU3IDcxIDYwIDY0LjI4NDMgNjAgNTZDNjAgNDcuNzE1NyA2Ni43MTU3IDQxIDc1IDQxWiIgZmlsbD0iI0NCRDVFRSIvPgo8cGF0aCBkPSJNNTAgODBDNTAgNzguNzkwMiA1Mi43OTAyIDc3IDU2IDc3SDk0Qzk3LjIwOTggNzcgMTAwIDc4Ljc5MDIgMTAwIDgwVjkyQzEwMCA5NC4yMDk4IDk3LjIwOTggOTYgOTQgOTZINTZDNTIuNzkwMiA5NiA1MCA5NC4yMDk4IDUwIDkyVjgwWiIgZmlsbD0iI0NCRDVFRSIvPgo8L3N2Zz4=';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="product-info-section">
            <div className="property-details">
              <div className="property-header">
                <h1 className="property-title product-text-black">{produto.nome}</h1>
                <div className="property-location">
                  <FaTag className="location-icon" />
                  <span className="product-text-black">{produto.tipo_produto}</span>
                </div>
              </div>

              <div className="property-price-section">
                <div className="price-container">
                  <span className="price-value product-text-black">
                    {formatCurrency(produto.valor)}
                  </span>
                </div>
                <div className="condominium-fee">
                  <span className="product-text-black">
                    {produto.tipo_comercializacao === 'Venda' ? 'Produto para Venda' : 'Produto em Promoção'}
                  </span>
                </div>
              </div>

              <div className="property-features">
                <div className="feature-item">
                  <FaBox className="feature-icon" />
                  <span className="product-text-black">{produto.quantidade} em estoque</span>
                </div>
                <div className="feature-item">
                  <FaWarehouse className="feature-icon" />
                  <span className="product-text-black">{produto.tipo_produto}</span>
                </div>
              </div>

              <div className="property-description-details">
                <h3 className="section-title">
                  Descrição do Produto
                </h3>
                <p className="product-text-black">
                  {produto.descricao || `Produto ${produto.nome} de alta qualidade. ${produto.tipo_comercializacao === 'Venda' ? 'Disponível para venda.' : 'Em promoção por tempo limitado.'}`}
                </p>
              </div>


              <div className="product-actions-section">
                <div className="quantity-selector">
                  <label>Quantidade:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleQuantidadeChange('decrementar')}
                      className="quantity-btn"
                      disabled={quantidade <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantidade}</span>
                    <button 
                      onClick={() => handleQuantidadeChange('incrementar')}
                      className="quantity-btn"
                      disabled={quantidade >= produto.quantidade}
                    >
                      +
                    </button>
                  </div>
                  <span className="stock-info">
                    {produto.quantidade} disponíveis
                  </span>
                </div>

                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#2d3748', 
                    fontWeight: '500',
                    fontSize: '14px'
                  }}>
                    Recado para o vendedor (customização):
                  </label>
                  <textarea
                    value={mensagemCustomizacao}
                    onChange={(e) => setMensagemCustomizacao(e.target.value)}
                    placeholder="Ex: Camisa 10 nome Thalis"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '80px',
                      boxSizing: 'border-box',
                      color: '#2d3748'
                    }}
                    maxLength={500}
                  />
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#718096', 
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {mensagemCustomizacao.length}/500
                  </div>
                </div>

                <button 
                  onClick={handleAdicionarCarrinho}
                  className="add-to-cart-button"
                  disabled={produto.quantidade === 0}
                >
                  <FaShoppingCart />
                  Adicionar ao Carrinho
                </button>
              </div>

              <div className="contact-section">
                <a 
                  href={`https://wa.me/555599293516?text=${encodeURIComponent('Olá, gostei de um produto que vi no seu site!')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-button"
                >
                  <FaWhatsapp />
                  Entrar em Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default ProductListDetails;