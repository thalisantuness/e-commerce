import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaSignOutAlt, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useProduto } from "../../context/ProdutoContext";
import Logo from "../../assets/logo-transparente.png";
import "./styles.css";

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { calcularQuantidadeTotal } = useProduto();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user_name") || localStorage.getItem("userName");
    
    if (token) {
      setIsLoggedIn(true);
      setUserName(user || "Usuário");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("userName");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user_phone");
    setIsLoggedIn(false);
    setUserName("");
    setShowDropdown(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/imovel-list?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
    }
  };

  const handleLoginClick = () => {
    navigate("/login-admin");
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  return (
    <header className="navbar-ecommerce">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="logo-section">
          <img src={Logo} className="logo-img" alt="Logo" />
        </Link>

        {/* Barra de Pesquisa */}
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

        {/* Menu de Navegação */}
        <nav className="nav-links">
          <Link to="/produto-list" className="nav-link">Produtos</Link>
          <Link to="/imovel-list" className="nav-link">Imóveis</Link>
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
                <FaUser className="user-icon" />
                <span className="user-name">{userName}</span>
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link 
                    to="/imovel-list-admin" 
                    className="dropdown-item"
                    onClick={() => setShowDropdown(false)}
                  >
                    <FaUser className="dropdown-icon" />
                    Painel Admin
                  </Link>
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