/**
 * Serviço de gerenciamento de pedidos
 */

import { getAuthToken, getUserId } from './authService';
import { filtrarPedidosEcommerce } from '../utils/ecommerceHelpers';

const API_BASE_URL = "https://back-pdv-production.up.railway.app";

/**
 * Cria um novo pedido
 * @param {Object} pedidoData - Dados do pedido
 * @returns {Promise<Object>}
 */
export async function criarPedido(pedidoData) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pedidoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar pedido');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
}

/**
 * Lista pedidos do cliente autenticado
 * @param {Object} filtros - Filtros opcionais (status, produto_id, empresa_id)
 * @returns {Promise<Array>}
 */
export async function listarPedidosCliente(filtros = {}) {
  try {
    const token = getAuthToken();
    const clienteId = getUserId();
    
    if (!token || !clienteId) {
      throw new Error('Usuário não autenticado');
    }

    // Montar query params
    const params = new URLSearchParams();
    params.append('cliente_id', clienteId);
    
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.produto_id) params.append('produto_id', filtros.produto_id);
    if (filtros.empresa_id) params.append('empresa_id', filtros.empresa_id);

    const response = await fetch(`${API_BASE_URL}/pedidos?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao listar pedidos');
    }

    const pedidos = await response.json();
    
    console.log('Pedidos retornados da API:', pedidos);
    
    // Retornar TODOS os pedidos do cliente
    // (não filtrar por menu, pois o cliente deve ver todos os seus pedidos)
    return pedidos;
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    throw error;
  }
}

/**
 * Busca detalhes de um pedido específico
 * @param {number} pedidoId - ID do pedido
 * @returns {Promise<Object>}
 */
export async function buscarPedido(pedidoId) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar pedido');
    }

    const pedido = await response.json();
    return pedido;
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    throw error;
  }
}

/**
 * Atualiza o status de um pedido
 * @param {number} pedidoId - ID do pedido
 * @param {string} novoStatus - Novo status do pedido (ex: 'confirmado', 'em_transporte', 'entregue')
 * @returns {Promise<Object>}
 */
export async function atualizarStatusPedido(pedidoId, novoStatus) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: novoStatus })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar status do pedido');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    throw error;
  }
}

/**
 * Decrementa o estoque de um produto
 * @param {number} produtoId - ID do produto
 * @param {number} quantidade - Quantidade a ser decrementada
 * @returns {Promise<Object>}
 */
export async function decrementarEstoque(produtoId, quantidade) {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/produtos/${produtoId}/estoque`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantidade_decrementar: quantidade })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao decrementar estoque');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao decrementar estoque:', error);
    throw error;
  }
}

/**
 * Cria pedidos para todos os itens do carrinho
 * @param {Array} carrinho - Array de itens do carrinho
 * @param {number} empresaIdPadrao - ID da empresa padrão (usado se o produto não tiver empresa_id)
 * @param {string|null} dataHoraEntrega - Data e hora de entrega (ISO 8601) - Opcional, pode ser null
 * @param {string} observacao - Observações do pedido (opcional)
 * @returns {Promise<Array>}
 */
export async function criarPedidosCarrinho(carrinho, empresaIdPadrao, dataHoraEntrega = null, observacao = '') {
  try {
    const pedidosCriados = [];
    const erros = [];

    for (const item of carrinho) {
      try {
        // Usar a empresa_id do produto se existir, caso contrário usa a empresa padrão
        const empresaId = item.empresa_id || empresaIdPadrao;
        
        // Combinar observação geral com mensagem de customização do item
        let observacaoFinal = observacao || '';
        if (item.mensagemCustomizacao) {
          const customizacao = `Customização: ${item.mensagemCustomizacao}`;
          observacaoFinal = observacaoFinal 
            ? `${observacaoFinal}\n${customizacao}` 
            : customizacao;
        }

        const pedidoData = {
          produto_id: item.produto_id,
          empresa_id: empresaId,
          quantidade: item.quantidade,
          ...(dataHoraEntrega ? { data_hora_entrega: dataHoraEntrega } : { data_hora_entrega: null }), // NULL permitido pelo banco
          observacao: observacaoFinal
        };

        console.log(`📦 Criando pedido para produto ${item.produto_id} com empresa ${empresaId}`);
        
        const pedido = await criarPedido(pedidoData);
        pedidosCriados.push(pedido);
      } catch (error) {
        console.error(`❌ Erro ao criar pedido para ${item.nome}:`, error);
        erros.push({
          produto: item.nome,
          erro: error.message
        });
      }
    }

    return {
      sucesso: pedidosCriados,
      erros: erros
    };
  } catch (error) {
    console.error('Erro ao criar pedidos do carrinho:', error);
    throw error;
  }
}

/**
 * Confirma o pagamento e finaliza os pedidos
 * (Atualiza status para 'confirmado' e decrementa estoque)
 * @param {Array} pedidos - Array de pedidos criados
 * @param {Array} carrinho - Array de itens do carrinho para decrementar estoque
 * @returns {Promise<Object>}
 */
export async function confirmarPagamentoPedidos(pedidos, carrinho) {
  try {
    const pedidosConfirmados = [];
    const erros = [];

    for (let i = 0; i < pedidos.length; i++) {
      const pedido = pedidos[i];
      const item = carrinho[i];

      try {
        // 1. Atualizar status do pedido para 'confirmado'
        await atualizarStatusPedido(pedido.pedido_id, 'confirmado');
        
        // 2. Decrementar estoque do produto
        await decrementarEstoque(item.produto_id, item.quantidade);
        
        pedidosConfirmados.push(pedido);
      } catch (error) {
        console.error(`Erro ao confirmar pedido ${pedido.pedido_id}:`, error);
        erros.push({
          pedido_id: pedido.pedido_id,
          produto: item.nome,
          erro: error.message
        });
      }
    }

    return {
      sucesso: pedidosConfirmados,
      erros: erros
    };
  } catch (error) {
    console.error('Erro ao confirmar pagamento dos pedidos:', error);
    throw error;
  }
}

