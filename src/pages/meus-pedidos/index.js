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
      
      // FILTRAR pedidos com produtos removidos
      const pedidosValidos = pedidosData.filter(pedido => {
        // Verificar se o produto existe e não foi removido
        const produto = pedido.Produto;
        if (!produto) return false;
        
        // Se o nome do produto é "Produto removido", filtrar este pedido
        if (produto.nome === "Produto removido" || produto.nome === null) {
          return false;
        }
        
        return true;
      });
      
      setPedidos(pedidosValidos);
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
  // Usa data URI para placeholder ao invés de fazer requisições externas
  const getImageUrl = (produto) => {
    if (!produto) {
      // Data URI para placeholder - não faz requisição HTTP
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAyNEM0Ni42IDI0IDUyIDI5LjQgNTIgMzZDNTIgNDIuNiA0Ni42IDQ4IDQwIDQ4QzMzLjQgNDggMjggNDIuNiAyOCAzNkMyOCAyOS40IDMzLjQgMjQgNDAgMjRaIiBmaWxsPSIjQ0JENUUwIi8+CjxwYXRoIGQ9Ik0yMCA1MkMyMCA0OS43OTAyIDIyLjc5MDIgNDggMjYgNDhINTJDNTUuMjA5OCA0OCA1OCA0OS43OTAyIDU4IDUyVjY4QzU4IDcwLjIwOTggNTUuMjA5OCA3MiA1MiA3MkgyNkMyMi43OTAyIDcyIDIwIDcwLjIwOTggMjAgNjhWNTJaIiBmaWxsPSIjQ0JENUUwIi8+Cjwvc3ZnPgo=';
    }
    
    const imageUrl = produto.foto_principal || 
                     produto.imageData || 
                     produto.image || 
                     produto.url_imagem;
    
    // Se não tiver imagem, usar data URI ao invés de fazer requisição externa
    if (!imageUrl) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAyNEM0Ni42IDI0IDUyIDI5LjQgNTIgMzZDNTIgNDIuNiA0Ni42IDQ4IDQwIDQ4QzMzLjQgNDggMjggNDIuNiAyOCAzNkMyOCAyOS40IDMzLjQgMjQgNDAgMjRaIiBmaWxsPSIjQ0JENUUwIi8+CjxwYXRoIGQ9Ik0yMCA1MkMyMCA0OS43OTAyIDIyLjc5MDIgNDggMjYgNDhINTJDNTUuMjA5OCA0OCA1OCA0OS43OTAyIDU4IDUyVjY4QzU4IDcwLjIwOTggNTUuMjA5OCA3MiA1MiA3MkgyNkMyMi43OTAyIDcyIDIwIDcwLjIwOTggMjAgNjhWNTJaIiBmaWxsPSIjQ0JENUUwIi8+Cjwvc3ZnPgo=';
    }
    
    return imageUrl;
  };

  // Função para filtrar pedidos com base na busca e status
  // NOTA: pedidos com produtos removidos já foram filtrados em fetchPedidos
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
        // Busca por nome do produto (sempre existe pois removemos os com "Produto removido")
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
                      alt={pedido.Produto?.nome || 'Produto'}
                      className="produto-image"
                      loading="lazy"
                      onError={(e) => {
                        // Prevenir loop infinito de requisições
                        if (e.target.dataset.errorHandled === 'true') return;
                        e.target.dataset.errorHandled = 'true';
                        
                        // Usar data URI ao invés de fazer nova requisição HTTP
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAyNEM0Ni42IDI0IDUyIDI5LjQgNTIgMzZDNTIgNDIuNiA0Ni42IDQ4IDQwIDQ4QzMzLjQgNDggMjggNDIuNiAyOCAzNkMyOCAyOS40IDMzLjQgMjQgNDAgMjRaIiBmaWxsPSIjQ0JENUUwIi8+CjxwYXRoIGQ9Ik0yMCA1MkMyMCA0OS43OTAyIDIyLjc5MDIgNDggMjYgNDhINTJDNTUuMjA5OCA0OCA1OCA0OS43OTAyIDU4IDUyVjY4QzU4IDcwLjIwOTggNTUuMjA5OCA3MiA1MiA3MkgyNkMyMi43OTAyIDcyIDIwIDcwLjIwOTggMjAgNjhWNTJaIiBmaWxsPSIjQ0JENUUwIi8+Cjwvc3ZnPgo=';
                      }}
                    />
                    <div className="produto-details">
                      <h3>{pedido.Produto?.nome || 'Produto'}</h3>
                      <p className="produto-quantidade">
                        Quantidade: {pedido.quantidade} un
                      </p>
                      <p className="produto-valor">
                        {formatCurrency(pedido.Produto?.valor || 0)} x {pedido.quantidade} = 
                        <strong> {formatCurrency((pedido.Produto?.valor || 0) * pedido.quantidade)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pedido-detalhes">
                    <div className="detalhe-item">
                      <FaStore />
                      <span>
                        <strong>Loja:</strong> {pedido.Empresa?.nome || 'N/A'}
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

