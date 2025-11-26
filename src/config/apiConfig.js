/**
 * Configuração centralizada da API
 * Altere aqui para usar API local ou produção
 */

// API Local (desenvolvimento)
const API_BASE_URL_LOCAL = "http://192.168.128.1:4000";

// API Produção
const API_BASE_URL_PRODUCTION = "https://back-pdv-production.up.railway.app";

// Usar API de produção
export const API_BASE_URL = API_BASE_URL_PRODUCTION;

// URL do Socket.IO (mesma da API)
export const SOCKET_URL = API_BASE_URL;

// Para usar API local, descomente as linhas abaixo e comente as de cima:
// export const API_BASE_URL = API_BASE_URL_LOCAL;
// export const SOCKET_URL = API_BASE_URL_LOCAL;

