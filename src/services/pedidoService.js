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
 * Cria pedidos para todos os itens do carrinho
 * @param {Array} carrinho - Array de itens do carrinho
 * @param {number} empresaId - ID da empresa
 * @param {string} dataHoraEntrega - Data e hora de entrega (ISO 8601)
 * @param {string} observacao - Observações do pedido (opcional)
 * @returns {Promise<Array>}
 */
export async function criarPedidosCarrinho(carrinho, empresaId, dataHoraEntrega, observacao = '') {
  try {
    const pedidosCriados = [];
    const erros = [];

    for (const item of carrinho) {
      try {
        const pedidoData = {
          produto_id: item.produto_id,
          empresa_id: empresaId,
          quantidade: item.quantidade,
          data_hora_entrega: dataHoraEntrega,
          observacao: observacao
        };

        const pedido = await criarPedido(pedidoData);
        pedidosCriados.push(pedido);
      } catch (error) {
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

