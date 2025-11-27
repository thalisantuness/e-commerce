import React from 'react';
import { getUserId } from '../../services/authService';
import './chat.css';

function ConversasList({ conversas, conversaAtual, onSelectConversa, mensagensNaoLidas, naoLidasPorConversa = {} }) {
  const userId = getUserId();

  // Obter informações do outro usuário na conversa
  const getOutroUsuario = (conversa) => {
    return userId === conversa.usuario1_id ? conversa.Usuario2 : conversa.Usuario1;
  };

  // Contar mensagens não lidas de uma conversa
  const contarNaoLidas = async (conversa) => {
    // Esta função será implementada quando carregarmos as mensagens
    // Por enquanto, retornamos 0
    return 0;
  };

  // Formatar última mensagem
  const formatarUltimaMensagem = (dataISO) => {
    const data = new Date(dataISO);
    const agora = new Date();
    const diffMs = agora - data;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  // Obter avatar
  const getAvatar = (usuario) => {
    const foto = usuario?.foto_perfil || 
                 usuario?.foto_principal || 
                 usuario?.imageData || 
                 usuario?.image || 
                 usuario?.url_imagem || 
                 usuario?.avatar || 
                 '';
    
    if (foto) return foto;
    
    // Avatar padrão com inicial
    const inicial = usuario?.nome?.charAt(0).toUpperCase() || '?';
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
        <circle cx="25" cy="25" r="25" fill="#4A90E2"/>
        <text x="25" y="32" font-family="Arial" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${inicial}</text>
      </svg>
    `)}`;
  };

  if (conversas.length === 0) {
    return (
      <div className="conversas-list-empty">
        <p>Você ainda não tem conversas</p>
        <span>Inicie uma conversa com uma empresa!</span>
      </div>
    );
  }

  return (
    <div className="conversas-list">
      {conversas.map((conversa) => {
        const outroUsuario = getOutroUsuario(conversa);
        const isActive = conversaAtual?.conversa_id === conversa.conversa_id;

        return (
          <div
            key={conversa.conversa_id}
            className={`conversa-item ${isActive ? 'conversa-active' : ''}`}
            onClick={() => onSelectConversa(conversa)}
          >
            <img 
              src={getAvatar(outroUsuario)} 
              alt={outroUsuario?.nome || 'Usuário'}
              className="conversa-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="conversa-info">
              <div className="conversa-header">
                <h4 className="conversa-nome">{outroUsuario?.nome || 'Usuário'}</h4>
                <span className="conversa-time">
                  {formatarUltimaMensagem(conversa.ultima_mensagem)}
                </span>
              </div>
              <p className="conversa-preview">
                {/* Aqui podemos adicionar preview da última mensagem quando disponível */}
              </p>
            </div>
            {/* Badge de notificações não lidas */}
            {naoLidasPorConversa[conversa.conversa_id] > 0 && (
              <span className="conversa-badge">
                {naoLidasPorConversa[conversa.conversa_id] > 99 ? '99+' : naoLidasPorConversa[conversa.conversa_id]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ConversasList;

