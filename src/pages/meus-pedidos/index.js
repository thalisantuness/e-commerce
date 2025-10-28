import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { 
  FaBox, 
  FaClock, 
  FaCheckCircle, 
  FaTruck, 
  FaTimesCircle,
  FaArrowLeft,
  FaStore,
  FaCalendar
} from "react-icons/fa";
import { listarPedidosCliente } from "../../services/pedidoService";
import { isAuthenticated } from "../../services/authService";
import { formatCurrency, formatDateTime, getStatusColor, getStatusText } from "../../utils/ecommerceHelpers";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "./styles.css";

function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      if (!isAuthenticated()) {
        setError('Você precisa estar logado para ver seus pedidos');
        setLoading(false);
        return;
      }

      const pedidosData = await listarPedidosCliente();
      setPedidos(pedidosData);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pendente': <FaClock />,
      'confirmado': <FaCheckCircle />,
      'em_transporte': <FaTruck />,
      'entregue': <FaCheckCircle />,
      'cancelado': <FaTimesCircle />
    };
    return icons[status] || <FaClock />;
  };

  // Função para obter a URL da imagem do produto
  const getImageUrl = (produto) => {
    if (!produto) return 'https://via.placeholder.com/80x80?text=Produto';
    // Tenta diferentes campos possíveis para a imagem
    return produto.foto_principal || 
           produto.imageData || 
           produto.image || 
           produto.url_imagem || 
           'https://via.placeholder.com/80x80?text=Produto';
  };

  // Função para filtrar pedidos com base na busca e status
  const pedidosFiltrados = (() => {
    let resultado = pedidos;
    
    // Filtro por status
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(p => p.status === filtroStatus);
    }
    
    // Filtro por busca
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const termoLower = searchTerm.toLowerCase();
      resultado = resultado.filter(pedido => {
        // Busca por ID do pedido
        if (pedido.pedido_id?.toString().includes(termoLower)) {
          return true;
        }
        // Busca por nome do produto
        if (pedido.Produto?.nome?.toLowerCase().includes(termoLower)) {
          return true;
        }
        // Busca por nome da empresa
        if (pedido.Empresa?.nome?.toLowerCase().includes(termoLower)) {
          return true;
        }
        // Busca por status
        if (getStatusText(pedido.status)?.toLowerCase().includes(termoLower)) {
          return true;
        }
        return false;
      });
    }
    
    return resultado;
  })();

  if (loading) {
    return (
      <div className="meus-pedidos-page">
        <NavBar />
        <div className="meus-pedidos-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando pedidos...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="meus-pedidos-page">
        <NavBar />
        <div className="meus-pedidos-container">
          <div className="error-state">
            <h2>Erro ao carregar pedidos</h2>
            <p>{error}</p>
            <Link to="/login-admin" className="login-link">
              Fazer Login
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="meus-pedidos-page">
      <NavBar />
      <div className="meus-pedidos-container">
        <div className="pedidos-header">
          <div className="header-top">
            <Link to="/" className="back-link">
              <FaArrowLeft />
              Voltar
            </Link>
            <h1>Meus Pedidos</h1>
          </div>

          {/* Mensagem de resultados de busca */}
          {searchParams.get('search') && (
            <div className="search-results-info">
              <p>
                Mostrando {pedidosFiltrados.length} resultado(s) para "{searchParams.get('search')}"
              </p>
            </div>
          )}

          {/* Filtros de Status */}
          <div className="status-filters">
            <button
              className={`filter-btn ${filtroStatus === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('todos')}
            >
              Todos ({pedidos.length})
            </button>
            <button
              className={`filter-btn ${filtroStatus === 'pendente' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('pendente')}
            >
              Pendentes ({pedidos.filter(p => p.status === 'pendente').length})
            </button>
            <button
              className={`filter-btn ${filtroStatus === 'confirmado' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('confirmado')}
            >
              Confirmados ({pedidos.filter(p => p.status === 'confirmado').length})
            </button>
            <button
              className={`filter-btn ${filtroStatus === 'em_transporte' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('em_transporte')}
            >
              Em Transporte ({pedidos.filter(p => p.status === 'em_transporte').length})
            </button>
            <button
              className={`filter-btn ${filtroStatus === 'entregue' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('entregue')}
            >
              Entregues ({pedidos.filter(p => p.status === 'entregue').length})
            </button>
          </div>
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="empty-state">
            <FaBox className="empty-icon" />
            <h2>Nenhum pedido encontrado</h2>
            <p>
              {filtroStatus === 'todos' 
                ? 'Você ainda não fez nenhum pedido'
                : `Você não tem pedidos com status "${getStatusText(filtroStatus)}"`
              }
            </p>
            <Link to="/produto-list" className="shop-btn">
              Começar a Comprar
            </Link>
          </div>
        ) : (
          <div className="pedidos-list">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.pedido_id} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-info">
                    <span className="pedido-id">Pedido #{pedido.pedido_id}</span>
                    <span className="pedido-data">
                      <FaCalendar />
                      {formatDateTime(pedido.data_cadastro)}
                    </span>
                  </div>
                  <div 
                    className="pedido-status"
                    style={{ 
                      backgroundColor: getStatusColor(pedido.status),
                      color: 'white'
                    }}
                  >
                    {getStatusIcon(pedido.status)}
                    {getStatusText(pedido.status)}
                  </div>
                </div>

                <div className="pedido-content">
                  <div className="produto-info">
                    <img 
                      src={getImageUrl(pedido.Produto)} 
                      alt={pedido.Produto.nome}
                      className="produto-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Produto';
                      }}
                    />
                    <div className="produto-details">
                      <h3>{pedido.Produto.nome}</h3>
                      <p className="produto-quantidade">
                        Quantidade: {pedido.quantidade} un
                      </p>
                      <p className="produto-valor">
                        {formatCurrency(pedido.Produto.valor)} x {pedido.quantidade} = 
                        <strong> {formatCurrency(pedido.Produto.valor * pedido.quantidade)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pedido-detalhes">
                    <div className="detalhe-item">
                      <FaStore />
                      <span>
                        <strong>Loja:</strong> {pedido.Empresa.nome}
                      </span>
                    </div>
                    <div className="detalhe-item">
                      <FaTruck />
                      <span>
                        <strong>Entrega prevista:</strong> {formatDateTime(pedido.data_hora_entrega)}
                      </span>
                    </div>
                    {pedido.observacao && (
                      <div className="detalhe-item observacao">
                        <strong>Observações:</strong> {pedido.observacao}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default MeusPedidos;

