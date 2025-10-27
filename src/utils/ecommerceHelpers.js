/**
 * Helpers para validação e gerenciamento do e-commerce
 */

/**
 * Valida se um produto pertence ao e-commerce
 * @param {Object} produto - Objeto do produto
 * @returns {boolean}
 */
export function isProdutoEcommerce(produto) {
  if (!produto || !produto.menu) return false;
  return produto.menu === 'ecommerce' || produto.menu === 'ambos';
}

/**
 * Valida se um pedido pertence ao e-commerce (baseado no produto do pedido)
 * @param {Object} pedido - Objeto do pedido
 * @returns {boolean}
 */
export function isPedidoEcommerce(pedido) {
  if (!pedido || !pedido.Produto || !pedido.Produto.menu) return false;
  return pedido.Produto.menu === 'ecommerce' || pedido.Produto.menu === 'ambos';
}

/**
 * Filtra array de produtos para retornar apenas produtos do e-commerce
 * @param {Array} produtos - Array de produtos
 * @returns {Array}
 */
export function filtrarProdutosEcommerce(produtos) {
  if (!Array.isArray(produtos)) return [];
  return produtos.filter(produto => isProdutoEcommerce(produto));
}

/**
 * Filtra array de pedidos para retornar apenas pedidos do e-commerce
 * @param {Array} pedidos - Array de pedidos
 * @returns {Array}
 */
export function filtrarPedidosEcommerce(pedidos) {
  if (!Array.isArray(pedidos)) return [];
  return pedidos.filter(pedido => isPedidoEcommerce(pedido));
}

/**
 * Valida se a empresa pode vender o produto
 * @param {Object} produto - Objeto do produto
 * @param {number} empresaId - ID da empresa
 * @returns {boolean}
 */
export function validarEmpresaAutorizada(produto, empresaId) {
  if (!produto || !produto.empresas_autorizadas || !Array.isArray(produto.empresas_autorizadas)) {
    return false;
  }
  return produto.empresas_autorizadas.includes(empresaId);
}

/**
 * Formata valor para moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata data para formato brasileiro
 * @param {string} dateString - String de data ISO
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora para formato brasileiro
 * @param {string} dateString - String de data ISO
 * @returns {string}
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}

/**
 * Retorna a cor de status do pedido
 * @param {string} status - Status do pedido
 * @returns {string}
 */
export function getStatusColor(status) {
  const statusColors = {
    'pendente': '#f59e0b',
    'confirmado': '#3b82f6',
    'em_transporte': '#8b5cf6',
    'entregue': '#10b981',
    'cancelado': '#ef4444'
  };
  return statusColors[status] || '#6b7280';
}

/**
 * Retorna o texto traduzido do status
 * @param {string} status - Status do pedido
 * @returns {string}
 */
export function getStatusText(status) {
  const statusTexts = {
    'pendente': 'Pendente',
    'confirmado': 'Confirmado',
    'em_transporte': 'Em Transporte',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  };
  return statusTexts[status] || status;
}

/**
 * Valida disponibilidade de estoque
 * @param {Object} produto - Objeto do produto
 * @param {number} quantidadeSolicitada - Quantidade desejada
 * @returns {boolean}
 */
export function validarEstoque(produto, quantidadeSolicitada) {
  if (!produto || typeof produto.quantidade !== 'number') return false;
  return produto.quantidade >= quantidadeSolicitada;
}

