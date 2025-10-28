import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaBox, FaTag, FaCheck } from "react-icons/fa";
import { useProduto } from "../../context/ProdutoContext";
import { criarPedidosCarrinho, confirmarPagamentoPedidos } from "../../services/pedidoService";
import { isAuthenticated } from "../../services/authService";
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
  
  const [loading, setLoading] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const empresaId = 1; // ID da empresa padrão (usado apenas como fallback se o produto não tiver empresa_id)
  const [dataEntrega, setDataEntrega] = useState('');
  const [observacao, setObservacao] = useState('');
  const [pedidosCriados, setPedidosCriados] = useState([]); // Armazena os pedidos criados
  
  // Dados do pagamento fake
  const [nomeCartao, setNomeCartao] = useState('');
  const [numeroCartao, setNumeroCartao] = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv] = useState('');
  const [cpf, setCpf] = useState('');
  
  const navigate = useNavigate();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleFinalizarCompra = () => {
    if (carrinho.length === 0) return;
    
    // Verificar se o usuário está autenticado
    if (!isAuthenticated()) {
      alert('Você precisa estar logado para finalizar a compra!');
      navigate('/login-admin');
      return;
    }
    
    // Abrir modal de checkout
    setShowCheckoutModal(true);
  };

  const handleConfirmarCheckout = async () => {
    if (!dataEntrega) {
      alert('Por favor, selecione uma data de entrega');
      return;
    }
    
    // Debug: verificar carrinho antes de criar pedidos
    console.log("🛒 Carrinho ao criar pedidos:", carrinho);
    console.log("🏢 Empresa ID padrão:", empresaId);
    carrinho.forEach((item, index) => {
      console.log(`  📦 Item ${index + 1}: ${item.nome} - empresa_id: ${item.empresa_id || 'NÃO TEM'}`);
    });
    
    // Criar os pedidos antes de ir para o pagamento
    setLoading(true);
    
    try {
      // Converter data para ISO 8601
      const dataISO = new Date(dataEntrega).toISOString();

      const resultado = await criarPedidosCarrinho(
        carrinho,
        empresaId,
        dataISO,
        observacao
      );

      if (resultado.sucesso.length > 0) {
        // Armazenar os pedidos criados para confirmar depois do pagamento
        setPedidosCriados(resultado.sucesso);
        
        // Fecha modal de checkout e abre modal de pagamento
        setShowCheckoutModal(false);
        setShowPaymentModal(true);
      } else {
        alert('Erro ao criar pedidos. Tente novamente.');
      }
    } catch (error) {
      alert('Erro ao criar pedidos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarPagamento = async () => {
    // Validar campos do pagamento
    if (!nomeCartao || !numeroCartao || !validade || !cvv || !cpf) {
      alert('Por favor, preencha todos os campos do pagamento');
      return;
    }

    // Processar pagamento e confirmar pedidos
    setLoading(true);
    
    try {
      // Confirmar pagamento: atualiza status para 'confirmado' e decrementa estoque
      const resultado = await confirmarPagamentoPedidos(pedidosCriados, carrinho);
      
      if (resultado.sucesso.length > 0) {
        console.log('✅ Pagamento confirmado! Pedidos atualizados e estoque decrementado.');
        
        // Limpar carrinho após confirmar pagamento
        limparCarrinho();
        
        setShowPaymentModal(false);
        setShowThankYouModal(true);
      } else {
        alert('Erro ao confirmar pagamento. Tente novamente.');
      }
      
      // Mostrar erros se houver
      if (resultado.erros.length > 0) {
        console.warn('⚠️ Alguns pedidos tiveram problemas:', resultado.erros);
      }
    } catch (error) {
      alert('Erro ao processar pagamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarProcesso = () => {
    // Limpar campos do formulário
    setNomeCartao('');
    setNumeroCartao('');
    setValidade('');
    setCvv('');
    setCpf('');
    setDataEntrega('');
    setObservacao('');
    setPedidosCriados([]);
    
    setShowThankYouModal(false);
    navigate('/meus-pedidos');
  };

  // Função para obter a URL da imagem do produto
  const getImageUrl = (produto) => {
    if (!produto) return 'https://via.placeholder.com/100x100?text=Produto';
    // Tenta diferentes campos possíveis para a imagem
    return produto.foto_principal || 
           produto.imageData || 
           produto.image || 
           produto.url_imagem || 
           'https://via.placeholder.com/100x100?text=Produto';
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

        {/* Modal de Checkout */}
        {showCheckoutModal && (
          <div className="checkout-modal-overlay">
            <div className="checkout-modal">
              <h2>Finalizar Pedido</h2>
              
              <div className="modal-form">
                <div className="form-group">
                  <label>Data de Entrega:</label>
                  <input
                    type="datetime-local"
                    value={dataEntrega}
                    onChange={(e) => setDataEntrega(e.target.value)}
                    className="form-input"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* CAMPO DE EMPRESA REMOVIDO - Agora usamos a empresa_id que vem do produto */}
                {/* 
                <div className="form-group">
                  <label>Empresa / Loja:</label>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(Number(e.target.value))}
                    className="form-input"
                  >
                    <option value={1}>Loja Principal</option>
                    <option value={2}>Loja Secundária</option>
                  </select>
                </div>
                */}

                <div className="form-group">
                  <label>Observações (opcional):</label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="form-textarea"
                    placeholder="Adicione observações sobre o pedido..."
                    rows={4}
                  />
                </div>

                <div className="modal-summary">
                  <p><strong>Resumo do Pedido:</strong></p>
                  {carrinho.map((item, index) => (
                    <p key={index} style={{ fontSize: '0.9rem', color: '#4a5568', marginLeft: '1rem' }}>
                      • {item.nome} - {item.quantidade}x {formatCurrency(item.valor)}
                    </p>
                  ))}
                  <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <p><strong>Total de Itens:</strong> {calcularQuantidadeTotal()}</p>
                  <p><strong>Valor Total:</strong> {formatCurrency(calcularTotal())}</p>
                </div>

                <div className="modal-actions">
                  <button
                    onClick={handleConfirmarCheckout}
                    className="confirm-btn"
                  >
                    <FaCheck />
                    Continuar para Pagamento
                  </button>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="cancel-btn"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pagamento */}
        {showPaymentModal && (
          <div className="checkout-modal-overlay">
            <div className="checkout-modal payment-modal">
              <h2>💳 Dados de Pagamento</h2>
              
              <div className="modal-form">
                <div className="payment-info">
                  <p>Complete os dados abaixo para finalizar sua compra</p>
                  <div className="payment-total">
                    <strong>Total a pagar:</strong> {formatCurrency(calcularTotal())}
                  </div>
                </div>

                <div className="form-group">
                  <label>Nome no Cartão:</label>
                  <input
                    type="text"
                    value={nomeCartao}
                    onChange={(e) => setNomeCartao(e.target.value.toUpperCase())}
                    className="form-input"
                    placeholder="NOME COMPLETO"
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Número do Cartão:</label>
                  <input
                    type="text"
                    value={numeroCartao}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
                      setNumeroCartao(formatted);
                    }}
                    className="form-input"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Validade:</label>
                    <input
                      type="text"
                      value={validade}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        const formatted = value.replace(/(\d{2})(\d{0,2})/, '$1/$2');
                        setValidade(formatted);
                      }}
                      className="form-input"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV:</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="form-input"
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>CPF do Titular:</label>
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                      const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
                      setCpf(formatted);
                    }}
                    className="form-input"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div className="payment-security">
                  <p>🔒 Pagamento 100% seguro e criptografado</p>
                </div>

                <div className="modal-actions">
                  <button
                    onClick={handleConfirmarPagamento}
                    className="confirm-btn payment-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : (
                      <>
                        <FaCheck />
                        Confirmar Pagamento
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setShowCheckoutModal(true);
                    }}
                    className="cancel-btn"
                    disabled={loading}
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Agradecimento */}
        {showThankYouModal && (
          <div className="checkout-modal-overlay">
            <div className="checkout-modal thank-you-modal">
              <div className="thank-you-content">
                <div className="success-icon">
                  <FaCheck />
                </div>
                <h2>Pagamento Processado!</h2>
                <div className="thank-you-message">
                  <p>
                    <strong>GATEWAY DEVE SER ESCOLHIDO PELO CLIENTE</strong>
                  </p>
                  <p className="highlight">
                    OBRIGADO POR USAR NOSSA PLATAFORMA
                  </p>
                </div>
                <div className="order-info">
                  <p>Seu pedido está sendo processado...</p>
                  <p className="total-paid">Valor: {formatCurrency(calcularTotal())}</p>
                </div>
                <button
                  onClick={handleFinalizarProcesso}
                  className="confirm-btn finalize-btn"
                  disabled={loading}
                >
                  {loading ? 'Finalizando...' : 'Ir para Meus Pedidos'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="cart-content">
          <div className="cart-items">
            {carrinho.map((item) => (
              <div key={item.produto_id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={getImageUrl(item)} 
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