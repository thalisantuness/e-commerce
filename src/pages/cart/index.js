// pages/cart/index.js
import React from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft } from "react-icons/fa";
import { useImovel } from "../../context/ImovelContext";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "./styles.css";

function Cart() {
  const { 
    carrinho, 
    removerDoCarrinho, 
    ajustarQuantidade, 
    limparCarrinho, 
    calcularTotal 
  } = useImovel();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleFinalizarCompra = () => {
    if (carrinho.length === 0) return;
    
    // Aqui você pode implementar a lógica de finalização de compra
    alert(`Compra finalizada! Total: ${formatCurrency(calcularTotal())}`);
    limparCarrinho();
  };

  if (carrinho.length === 0) {
    return (
      <div className="cart-page">
        <NavBar />
        <div className="cart-container">
          <div className="cart-empty">
            <FaShoppingBag className="empty-icon" />
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione alguns imóveis para começar</p>
            <Link to="/imovel-list" className="continue-shopping-btn">
              <FaArrowLeft />
              Continuar Comprando
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <NavBar />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Meu Carrinho</h1>
          <span className="cart-items-count">{carrinho.length} ite{carrinho.length === 1 ? 'm' : 'ns'}</span>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {carrinho.map((item) => (
              <div key={item.imovel_id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.imageData} 
                    alt={item.nome}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Imagem';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.nome}</h3>
                  <p className="item-description">
                    {item.description.length > 100 
                      ? `${item.description.substring(0, 100)}...` 
                      : item.description
                    }
                  </p>
                  <div className="item-location">
                    📍 {item.cidade.nome}, {item.estado.nome}
                  </div>
                  <div className="item-features">
                    <span>🛏️ {item.n_quartos} quarto{item.n_quartos !== 1 ? 's' : ''}</span>
                    <span>🚿 {item.n_banheiros} banheiro{item.n_banheiros !== 1 ? 's' : ''}</span>
                    <span>🚗 {item.n_vagas} vaga{item.n_vagas !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => ajustarQuantidade(item.imovel_id, item.quantidade - 1)}
                      className="quantity-btn"
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantidade}</span>
                    <button 
                      onClick={() => ajustarQuantidade(item.imovel_id, item.quantidade + 1)}
                      className="quantity-btn"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <div className="item-price">
                    <span className="unit-price">{formatCurrency(item.valor)}</span>
                    <span className="total-price">
                      {formatCurrency(item.valor * item.quantidade)}
                    </span>
                  </div>

                  <button 
                    onClick={() => removerDoCarrinho(item.imovel_id)}
                    className="remove-btn"
                    title="Remover do carrinho"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Resumo do Pedido</h3>
              
              <div className="summary-line">
                <span>Subtotal ({carrinho.reduce((total, item) => total + item.quantidade, 0)} itens):</span>
                <span>{formatCurrency(calcularTotal())}</span>
              </div>
              
              <div className="summary-line">
                <span>Taxas e impostos:</span>
                <span>R$ 0,00</span>
              </div>
              
              <div className="summary-line">
                <span>Desconto:</span>
                <span className="discount">- R$ 0,00</span>
              </div>
              
              <div className="summary-total">
                <span>Total:</span>
                <span className="total-amount">{formatCurrency(calcularTotal())}</span>
              </div>

              <button 
                className="checkout-btn"
                onClick={handleFinalizarCompra}
              >
                Finalizar Compra
              </button>

              <button 
                className="clear-cart-btn"
                onClick={limparCarrinho}
              >
                Limpar Carrinho
              </button>

              <Link to="/imovel-list" className="continue-shopping-link">
                <FaArrowLeft />
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;