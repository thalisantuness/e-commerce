/**
 * Serviço de autenticação e gerenciamento de token
 */

import { API_BASE_URL } from '../config/apiConfig';

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

/**
 * Busca dados completos do usuário autenticado
 * @returns {Promise<Object>}
 */
export async function buscarDadosUsuario() {
  try {
    const token = getAuthToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao buscar dados do usuário');
    }

    const usuario = await response.json();
    return usuario;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw error;
  }
}

/**
 * Atualiza a foto de perfil do usuário autenticado
 * @param {string} fotoBase64 - Foto em base64
 * @returns {Promise<Object>}
 */
export async function atualizarFotoUsuario(fotoBase64) {
  try {
    const token = getAuthToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      throw new Error('Usuário não autenticado');
    }

    if (!fotoBase64) {
      throw new Error('Foto não fornecida');
    }

    console.log('📤 Enviando foto para atualização:', {
      userId,
      rota: `/usuarios/${userId}/foto`,
      fotoSize: fotoBase64.length,
      fotoPreview: fotoBase64.substring(0, 50) + '...'
    });

    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/foto`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ foto_perfil: fotoBase64 })
    });

    if (!response.ok) {
      // Tentar parsear JSON, se falhar pode ser HTML de erro
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const textError = await response.text();
        console.error('❌ Erro ao atualizar foto (HTML):', textError);
        throw new Error(`Erro ${response.status}: Não foi possível atualizar a foto`);
      }
      console.error('❌ Erro ao atualizar foto:', errorData);
      throw new Error(errorData.message || errorData.error || 'Erro ao atualizar foto do usuário');
    }

    const responseData = await response.json();
    console.log('✅ Foto atualizada com sucesso:', responseData);
    
    // A resposta pode vir como { usuario: {...} } ou diretamente como usuario
    const usuarioAtualizado = responseData.usuario || responseData;
    
    // Atualizar foto no localStorage (prioridade para foto_perfil)
    const foto = usuarioAtualizado.foto_perfil || 
                 usuarioAtualizado.foto_principal || 
                 usuarioAtualizado.imageData || 
                 usuarioAtualizado.image || 
                 usuarioAtualizado.url_imagem || 
                 usuarioAtualizado.avatar || 
                 usuarioAtualizado.photo || 
                 "";
    
    if (foto) {
      localStorage.setItem('user_photo', foto);
      console.log('📸 Foto atualizada no localStorage:', foto);
    } else {
      localStorage.removeItem('user_photo');
      console.log('📸 Foto removida do localStorage');
    }
    
    return usuarioAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar foto do usuário:', error);
    throw error;
  }
}

/**
 * Atualiza dados do usuário autenticado
 * Usa a rota /usuarios/{id}/perfil que permite o usuário atualizar seu próprio perfil
 * @param {Object} dadosAtualizados - Dados para atualizar (nome, email, telefone, etc) - NÃO inclui foto_principal
 * @returns {Promise<Object>}
 */
export async function atualizarDadosUsuario(dadosAtualizados) {
  try {
    const token = getAuthToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      throw new Error('Usuário não autenticado');
    }

    // Remover foto_principal dos dados, pois ela deve ser atualizada pela rota específica
    const { foto_principal, ...dadosSemFoto } = dadosAtualizados;

    // Log para debug
    console.log('📤 Enviando dados para atualização:', {
      userId,
      rota: `/usuarios/${userId}/perfil`,
      dadosAtualizados: dadosSemFoto
    });

    const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/perfil`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dadosSemFoto)
    });

    if (!response.ok) {
      // Tentar parsear JSON, se falhar pode ser HTML de erro
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const textError = await response.text();
        console.error('❌ Erro na resposta (HTML):', textError);
        throw new Error(`Erro ${response.status}: Não foi possível atualizar o perfil`);
      }
      console.error('❌ Erro na resposta:', errorData);
      throw new Error(errorData.message || errorData.error || 'Erro ao atualizar dados do usuário');
    }

    const responseData = await response.json();
    console.log('✅ Usuário atualizado com sucesso:', responseData);
    
    // A resposta pode vir como { usuario: {...} } ou diretamente como usuario
    const usuarioAtualizado = responseData.usuario || responseData;
    
    // Atualizar localStorage com novos dados
    if (usuarioAtualizado.nome) {
      localStorage.setItem('user_name', usuarioAtualizado.nome);
    }
    if (usuarioAtualizado.email) {
      localStorage.setItem('user_email', usuarioAtualizado.email);
    }
    if (usuarioAtualizado.telefone) {
      localStorage.setItem('user_phone', usuarioAtualizado.telefone);
    }
    
    return usuarioAtualizado;
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    throw error;
  }
}

