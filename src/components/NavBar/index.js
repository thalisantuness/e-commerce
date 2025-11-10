import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useProduto } from "../../context/ProdutoContext";
import Logo from "../../assets/logo-transparente.png";
import "./styles.css";

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [photoError, setPhotoError] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { calcularQuantidadeTotal, empresaAtual, setEmpresaAtual } = useProduto();
  const [empresaLogo, setEmpresaLogo] = useState(null);
  const [empresaNome, setEmpresaNome] = useState(null);

  // Função para carregar dados do usuário
  const loadUserData = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user_name") || localStorage.getItem("userName");
    // Buscar foto_perfil primeiro, depois outros campos possíveis
    const photo = localStorage.getItem("user_photo") || 
                   localStorage.getItem("userPhoto") || 
                   localStorage.getItem("user_foto_perfil") ||
                   "";
    
    if (token) {
      setIsLoggedIn(true);
      setUserName(user || "Usuário");
      setUserPhoto(photo);
      setPhotoError(false); // Resetar erro ao carregar novos dados
      
      // Debug para verificar foto
      if (photo) {
        console.log("👤 Foto do usuário carregada na NavBar:", photo);
      }
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserPhoto("");
      setPhotoError(false);
    }
  };

  useEffect(() => {
    loadUserData();

    // Listener para mudanças no localStorage (quando usuário faz login em outra aba)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user_name" || e.key === "user_photo") {
        loadUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Função para obter a logo da empresa
  const getEmpresaLogo = (empresa) => {
    if (!empresa) return null;
    
    const logo = empresa.logo || 
                 empresa.logo_url ||
                 empresa.foto_perfil || 
                 empresa.foto_principal ||
                 empresa.imageData ||
                 empresa.url_logo;
    
    // Retornar apenas se for uma URL válida ou base64
    if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('data:image'))) {
      return logo;
    }
    
    return null;
  };

  // A empresa agora é definida pelos componentes de produtos (ProdutosList, HomeProducts, ProductDetails)
  // Não precisamos buscar a empresa do usuário logado aqui

  // Atualizar logo da empresa quando empresaAtual mudar
  useEffect(() => {
    if (empresaAtual) {
      const logo = getEmpresaLogo(empresaAtual);
      setEmpresaLogo(logo);
      setEmpresaNome(empresaAtual.nome || empresaAtual.razao_social || empresaAtual.nome_fantasia || null);
      console.log('🎨 Logo da empresa atualizada:', logo);
    } else {
      setEmpresaLogo(null);
      setEmpresaNome(null);
    }
  }, [empresaAtual]);

  // Limpar empresa quando sair das páginas de produtos
  // A empresa será redefinida quando entrar em páginas que carregam produtos
  useEffect(() => {
    // Verificar se está em páginas de produtos
    const isProdutoPage = 
      location.pathname.includes('/detalhes-produto') ||
      location.pathname.includes('/product-details') ||
      location.pathname.includes('/produto/') ||
      location.pathname === '/produto-list' ||
      location.pathname === '/';
    
    // Se não estiver em páginas de produtos, limpar a empresa após um delay
    if (!isProdutoPage) {
      const timer = setTimeout(() => {
        setEmpresaAtual(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, setEmpresaAtual]);

  // Verificar mudanças no localStorage periodicamente (para atualizar após login na mesma aba)
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      const hasToken = !!currentToken;
      
      if (hasToken !== isLoggedIn) {
        loadUserData();
      } else if (hasToken) {
        // Verificar se a foto mudou
        const currentPhoto = localStorage.getItem("user_photo");
        if (currentPhoto !== userPhoto) {
          loadUserData();
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isLoggedIn, userPhoto]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userName");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_photo");
    setIsLoggedIn(false);
    setUserName("");
    setUserPhoto("");
    setShowDropdown(false);
    setEmpresaAtual(null); // Limpar empresa ao fazer logout
    navigate("/");
  };

  // Função de busca - apenas produtos
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/produto-list?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  /* FUNÇÃO ORIGINAL DE BUSCA DE IMÓVEIS - MANTIDA PARA USO FUTURO
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/imovel-list?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };
  */

  const handleLoginClick = () => {
    navigate("/login-admin");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <header className="navbar-ecommerce">
      <div className="navbar-container">
        {/* Logo - Mostra logo da empresa se disponível, senão mostra logo padrão */}
        <Link to="/" className="logo-section">
          {empresaLogo ? (
            <img 
              src={empresaLogo} 
              className="logo-img" 
              alt={empresaNome || "Logo da empresa"}
              style={{ maxHeight: '60px', objectFit: 'contain' }}
              onError={(e) => {
                // Se a logo da empresa falhar, usar logo padrão
                e.target.src = Logo;
              }}
            />
          ) : (
            <img src={Logo} className="logo-img" alt="Logo" />
          )}
        </Link>

        {/* Barra de Pesquisa */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
        </div>

        {/* CÓDIGO ORIGINAL DA BARRA DE PESQUISA - MANTIDO PARA USO FUTURO
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Buscar imóveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
        </div>
        */}

        {/* Menu de Navegação */}
        <nav className="nav-links">
          <Link to="/produto-list" className="nav-link">Produtos</Link>
          {/* <Link to="/imovel-list" className="nav-link">Imóveis</Link> */}
          {isLoggedIn && (
            <Link to="/meus-pedidos" className="nav-link">Meus Pedidos</Link>
          )}
        </nav>

        {/* Área do Usuário */}
        <div className="user-section">
          {isLoggedIn ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {userPhoto && !photoError ? (
                  <img 
                    src={userPhoto} 
                    alt={`Avatar de ${userName}`} 
                    className="user-avatar"
                    onError={() => {
                      console.log("⚠️ Erro ao carregar foto do usuário, usando ícone");
                      setPhotoError(true);
                    }}
                  />
                ) : (
                  <FaUser className="user-icon" />
                )}
                <span className="user-name">{userName}</span>
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link 
                    to="/perfil" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    {userPhoto && !photoError ? (
                      <img 
                        src={userPhoto} 
                        alt={`Avatar de ${userName}`} 
                        className="user-avatar"
                        onError={() => setPhotoError(true)}
                      />
                    ) : (
                      <FaUser className="dropdown-icon" />
                    )}
                    Meu Perfil
                  </Link>
                  {/* ITEM PAINEL ADMIN DA PARETE DE IMOVEIS OCULTADO
                  <Link 
                    to="/imovel-list-admin" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaUser className="dropdown-icon" />
                    Painel Admin
                  </Link>
                  */}
                  <button 
                    className="dropdown-item logout-button"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="dropdown-icon" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              <FaUser className="login-icon" />
              <span>Entrar</span>
            </button>
          )}

          {/* Ícone do Carrinho com contador */}
          <button className="cart-button" onClick={handleCartClick}>
            <FaShoppingCart className="cart-icon" />
            <span className="cart-count">{calcularQuantidadeTotal()}</span>
          </button>
        </div>
      </div>
    </header>
  );
}