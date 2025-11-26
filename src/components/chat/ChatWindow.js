import React, { useState, useEffect, useRef } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { FaPaperPlane } from 'react-icons/fa';
import { getUserId } from '../../services/authService';
import MessageBubble from './MessageBubble';
import './chat.css';

function ChatWindow({ conversa, mensagens, enviarMensagem, onBack }) {
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const mensagensEndRef = useRef(null);
  const userId = getUserId();

  // Auto-scroll para última mensagem
  useEffect(() => {
    mensagensEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Obter informações do destinatário
  const getDestinatario = () => {
    if (!conversa) return null;
    
    // usuario1_id é sempre o cliente, usuario2_id é sempre a empresa
    const destinatario = userId === conversa.usuario1_id 
      ? conversa.Usuario2 
      : conversa.Usuario1;
    
    return destinatario;
  };

  const destinatario = getDestinatario();

  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!novaMensagem.trim() || enviando) return;

    try {
      setEnviando(true);
      
      // Obter ID do destinatário (empresa)
      const destinatarioId = destinatario?.usuario_id || conversa.usuario2_id;
      
      enviarMensagem(novaMensagem, destinatarioId);
      setNovaMensagem('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setEnviando(false);
    }
  };

  // Obter avatar do destinatário
  const getAvatar = () => {
    if (!destinatario) return '';
    
    const foto = destinatario.foto_perfil || 
                 destinatario.foto_principal || 
                 destinatario.imageData || 
                 destinatario.image || 
                 destinatario.url_imagem || 
                 destinatario.avatar || 
                 '';
    
    if (foto) return foto;
    
    // Avatar padrão com inicial
    const inicial = destinatario.nome?.charAt(0).toUpperCase() || '?';
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#4A90E2"/>
        <text x="20" y="26" font-family="Arial" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${inicial}</text>
      </svg>
    `)}`;
  };

  if (!conversa) {
    return (
      <div className="chat-window-empty">
        <p>Selecione uma conversa para começar</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button onClick={onBack} className="chat-back-button">
          <IoIosArrowBack />
        </button>
        <img 
          src={getAvatar()} 
          alt={destinatario?.nome || 'Usuário'}
          className="chat-header-avatar"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="chat-header-info">
          <h3>{destinatario?.nome || 'Usuário'}</h3>
          <span className="chat-header-status">
            {destinatario?.role === 'empresa' ? 'Empresa' : 'Usuário'}
          </span>
        </div>
      </div>

      <div className="chat-messages">
        {mensagens.length === 0 ? (
          <div className="chat-empty-messages">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        ) : (
          mensagens.map((mensagem) => (
            <MessageBubble key={mensagem.mensagem_id} mensagem={mensagem} />
          ))
        )}
        <div ref={mensagensEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleEnviar}>
        <input
          type="text"
          value={novaMensagem}
          onChange={(e) => setNovaMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="chat-input"
          disabled={enviando}
        />
        <button 
          type="submit" 
          className="chat-send-button"
          disabled={!novaMensagem.trim() || enviando}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;

