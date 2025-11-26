/**
 * Serviço de chat - Comunicação REST com a API
 */

import { getAuthHeaders } from "./authService";
import { API_BASE_URL } from '../config/apiConfig';

/**
 * Lista todas as conversas do usuário autenticado
 * @returns {Promise<Array>}
 */
export async function listarConversas() {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/conversas`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao listar conversas');
    }

    const conversas = await response.json();
    return conversas;
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    throw error;
  }
}

/**
 * Cria uma nova conversa com um destinatário
 * @param {number} destinatario_id - ID do destinatário (empresa ou funcionário)
 * @returns {Promise<Object>}
 */
export async function criarConversa(destinatario_id) {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/conversas`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ destinatario_id })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao criar conversa');
    }

    const data = await response.json();
    return data.conversa || data;
  } catch (error) {
    console.error('Erro ao criar conversa:', error);
    throw error;
  }
}

/**
 * Lista todas as mensagens de uma conversa
 * @param {number} conversa_id - ID da conversa
 * @returns {Promise<Array>}
 */
export async function listarMensagens(conversa_id) {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/conversas/${conversa_id}/mensagens`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao listar mensagens');
    }

    const mensagens = await response.json();
    return mensagens;
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    throw error;
  }
}

/**
 * Marca uma mensagem como lida
 * @param {number} mensagem_id - ID da mensagem
 * @returns {Promise<Object>}
 */
export async function marcarMensagemComoLida(mensagem_id) {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/mensagens/${mensagem_id}/lida`, {
      method: 'PUT',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao marcar mensagem como lida');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao marcar mensagem como lida:', error);
    throw error;
  }
}

/**
 * Conta mensagens não lidas de todas as conversas
 * @returns {Promise<number>}
 */
export async function contarMensagensNaoLidas() {
  try {
    const conversas = await listarConversas();
    let totalNaoLidas = 0;

    for (const conversa of conversas) {
      const mensagens = await listarMensagens(conversa.conversa_id);
      const naoLidas = mensagens.filter(
        msg => !msg.lida && msg.remetente_id !== parseInt(localStorage.getItem('user_id'))
      );
      totalNaoLidas += naoLidas.length;
    }

    return totalNaoLidas;
  } catch (error) {
    console.error('Erro ao contar mensagens não lidas:', error);
    return 0;
  }
}

