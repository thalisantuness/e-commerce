/**
 * Serviço de autenticação e gerenciamento de token
 */

const API_BASE_URL = "https://back-pdv-production.up.railway.app";

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>}
 */
export async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao fazer login');
    }

    const data = await response.json();
    
    // Armazenar token e informações do usuário
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.usuario.usuario_id);
      localStorage.setItem('user_name', data.usuario.nome);
      localStorage.setItem('user_email', data.usuario.email);
      localStorage.setItem('user_type', data.usuario.tipo); // 'cliente' ou 'empresa'
    }

    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

/**
 * Faz logout do usuário
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_type');
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
  return !!token;
}

/**
 * Obtém o token de autenticação
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem('token') || localStorage.getItem('auth_token');
}

/**
 * Obtém o ID do usuário autenticado
 * @returns {number|null}
 */
export function getUserId() {
  const userId = localStorage.getItem('user_id');
  return userId ? parseInt(userId) : null;
}

/**
 * Obtém o nome do usuário autenticado
 * @returns {string|null}
 */
export function getUserName() {
  return localStorage.getItem('user_name');
}

/**
 * Obtém o email do usuário autenticado
 * @returns {string|null}
 */
export function getUserEmail() {
  return localStorage.getItem('user_email');
}

/**
 * Obtém o tipo do usuário autenticado
 * @returns {string|null}
 */
export function getUserType() {
  return localStorage.getItem('user_type');
}

/**
 * Verifica se o usuário é cliente
 * @returns {boolean}
 */
export function isCliente() {
  return getUserType() === 'cliente';
}

/**
 * Verifica se o usuário é empresa
 * @returns {boolean}
 */
export function isEmpresa() {
  return getUserType() === 'empresa';
}

/**
 * Obtém headers para requisições autenticadas
 * @returns {Object}
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

