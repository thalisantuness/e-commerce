import React from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaBox, FaTag } from "react-icons/fa";
import { useProduto } from "../../context/ProdutoContext";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "./styles.css";

function Cart() {
  const { 
    carrinho, 
    removerDoCarrinho, 
    ajustarQuantidade, 
    limparCarrinho, 
    calcularTotal,
    calcularQuantidadeTotal
  } = useProduto();

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

  const getProductFeatures = (produto) => {
    return [
      {
        icon: <FaBox />,
        text: `${produto.quantidade} em estoque`
      },
      {
        icon: <FaTag />,
        text: produto.tipo_produto
      }
    ];
  };

  if (carrinho.length === 0) {
    return (
      <div className="cart-page">
        <NavBar />
        <div className="cart-container">
          <div className="cart-empty">
            <FaShoppingBag className="empty-icon" />
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione alguns produtos para começar</p>
            <Link to="/" className="continue-shopping-btn">
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
          <span className="cart-items-count">
            {calcularQuantidadeTotal()} ite{calcularQuantidadeTotal() === 1 ? 'm' : 'ns'}
          </span>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {carrinho.map((item) => (
              <div key={item.produto_id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.foto_principal} 
                    alt={item.nome}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=Produto';
                    }}
                  />
                </div>
                
                <div className="item-details">
                  <h3 className="item-title">{item.nome}</h3>
                  <p className="item-description">
                    {item.tipo_comercializacao === 'Venda' ? 'Produto para venda' : 'Produto em promoção'}
                  </p>
                  <div className="item-category">
                    <FaTag />
                    {item.tipo_produto}
                  </div>
                  <div className="item-features">
                    {getProductFeatures(item).map((feature, index) => (
                      <span key={index}>
                        {feature.icon} {feature.text}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="item-controls">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => ajustarQuantidade(item.produto_id, item.quantidade - 1)}
                      className="quantity-btn"
                    >
                      <FaMinus />
                    </button>
                    <span className="quantity">{item.quantidade}</span>
                    <button 
                      onClick={() => ajustarQuantidade(item.produto_id, item.quantidade + 1)}
                      className="quantity-btn"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  
                  <div className="item-price">
                    <span className="unit-price">{formatCurrency(item.valor)}/un</span>
                    <span className="total-price">
                      {formatCurrency(item.valor * item.quantidade)}
                    </span>
                  </div>

                  <button 
                    onClick={() => removerDoCarrinho(item.produto_id)}
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
                <span>Subtotal ({calcularQuantidadeTotal()} itens):</span>
                <span>{formatCurrency(calcularTotal())}</span>
              </div>
              
              <div className="summary-line">
                <span>Frete:</span>
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

              <Link to="/" className="continue-shopping-link">
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