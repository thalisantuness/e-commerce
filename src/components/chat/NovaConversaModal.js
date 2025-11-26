import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaStore } from 'react-icons/fa';
import axios from 'axios';
import { getAuthToken } from '../../services/authService';
import { API_BASE_URL } from '../../config/apiConfig';
import './chat.css';

function NovaConversaModal({ isOpen, onClose, onSelectEmpresa }) {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Buscar empresas que têm produtos
  useEffect(() => {
    if (isOpen) {
      buscarEmpresas();
    }
  }, [isOpen]);

  const buscarEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getAuthToken();
      
      // Buscar todos os usuários
      const response = await axios.get(`${API_BASE_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Filtrar apenas empresas e funcionários de empresas
      const empresasList = response.data.filter(usuario => {
        const role = usuario.role || usuario.tipo || usuario.user_type;
        return role === 'empresa' || role === 'empresa-funcionario';
      });

      setEmpresas(empresasList);
    } catch (err) {
      console.error('Erro ao buscar empresas:', err);
      setError('Erro ao buscar empresas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empresas pelo termo de busca
  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectEmpresa = (empresa) => {
    onSelectEmpresa(empresa.usuario_id);
    onClose();
  };

  // Obter avatar
  const getAvatar = (empresa) => {
    const foto = empresa?.foto_perfil || 
                 empresa?.foto_principal || 
                 empresa?.imageData || 
                 empresa?.image || 
                 empresa?.url_imagem || 
                 empresa?.avatar || 
                 '';
    
    if (foto) return foto;
    
    // Avatar padrão com inicial
    const inicial = empresa?.nome?.charAt(0).toUpperCase() || '?';
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="25" fill="#4A90E2"/>
        <text x="25" y="32" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${inicial}</text>
      </svg>
    `)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content nova-conversa-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nova Conversa</h2>
          <button className="modal-close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="search-empresa-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-empresa-input"
            />
          </div>

          {loading ? (
            <div className="empresas-loading">
              <div className="chat-spinner"></div>
              <p>Carregando empresas...</p>
            </div>
          ) : error ? (
            <div className="empresas-error">
              <p>{error}</p>
              <button onClick={buscarEmpresas} className="chat-retry-button">
                Tentar novamente
              </button>
            </div>
          ) : empresasFiltradas.length === 0 ? (
            <div className="empresas-empty">
              <p>Nenhuma empresa encontrada</p>
              {searchTerm && (
                <span>Tente buscar com outro termo</span>
              )}
            </div>
          ) : (
            <div className="empresas-list">
              {empresasFiltradas.map((empresa) => (
                <div
                  key={empresa.usuario_id}
                  className="empresa-item"
                  onClick={() => handleSelectEmpresa(empresa)}
                >
                  <img 
                    src={getAvatar(empresa)} 
                    alt={empresa.nome || 'Empresa'}
                    className="empresa-avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="empresa-info">
                    <h4 className="empresa-nome">{empresa.nome || 'Empresa'}</h4>
                    {empresa.email && (
                      <span className="empresa-email">{empresa.email}</span>
                    )}
                  </div>
                  <FaStore className="empresa-icon" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NovaConversaModal;

