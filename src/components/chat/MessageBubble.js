import React from 'react';
import { getUserId } from '../../services/authService';
import './chat.css';

function MessageBubble({ mensagem }) {
  const userId = getUserId();
  const isMine = mensagem.remetente_id === userId;
  const remetente = mensagem.Remetente || {};

  // Formatar data
  const formatarData = (dataISO) => {
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
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter avatar
  const getAvatar = () => {
    const foto = remetente.foto_perfil || 
                 remetente.foto_principal || 
                 remetente.imageData || 
                 remetente.image || 
                 remetente.url_imagem || 
                 remetente.avatar || 
                 '';
    
    if (foto) return foto;
    
    // Avatar padrão com inicial
    const inicial = remetente.nome?.charAt(0).toUpperCase() || '?';
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#4A90E2"/>
        <text x="20" y="26" font-family="Arial" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${inicial}</text>
      </svg>
    `)}`;
  };

  return (
    <div className={`message-bubble ${isMine ? 'message-mine' : 'message-other'}`}>
      {!isMine && (
        <img 
          src={getAvatar()} 
          alt={remetente.nome || 'Usuário'}
          className="message-avatar"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <div className="message-content">
        {!isMine && (
          <div className="message-sender-name">{remetente.nome || 'Usuário'}</div>
        )}
        <div className="message-text">{mensagem.conteudo}</div>
        <div className="message-time">{formatarData(mensagem.data_envio)}</div>
      </div>
    </div>
  );
}

export default MessageBubble;

