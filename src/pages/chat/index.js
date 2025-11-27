import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import ConversasList from '../../components/chat/ConversasList';
import ChatWindow from '../../components/chat/ChatWindow';
import NovaConversaModal from '../../components/chat/NovaConversaModal';
import { useChat } from '../../hooks/useChat';
import { isAuthenticated } from '../../services/authService';
import './styles.css';

function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'chat'
  const [showNovaConversaModal, setShowNovaConversaModal] = useState(false);
  
  const {
    conversas,
    conversaAtual,
    mensagens,
    loading,
    error,
    mensagensNaoLidas,
    naoLidasPorConversa,
    atualizarConversas,
    abrirConversa,
    novaConversa,
    enviarMensagem,
    atualizarContadorNaoLidas
  } = useChat();

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login-admin');
    }
  }, [navigate]);

  // Verificar se há empresa_id na URL (para iniciar conversa)
  useEffect(() => {
    const empresaId = searchParams.get('empresa_id');
    if (empresaId && conversas.length > 0) {
      // Procurar conversa existente com essa empresa
      const conversaExistente = conversas.find(
        conv => conv.usuario2_id === parseInt(empresaId)
      );
      
      if (conversaExistente) {
        abrirConversa(conversaExistente);
        setViewMode('chat');
      } else {
        // Criar nova conversa
        novaConversa(parseInt(empresaId))
          .then((novaConv) => {
            abrirConversa(novaConv);
            setViewMode('chat');
          })
          .catch((err) => {
            console.error('Erro ao criar conversa:', err);
          });
      }
    }
  }, [searchParams, conversas, abrirConversa, novaConversa]);

  const handleSelectConversa = async (conversa) => {
    await abrirConversa(conversa);
    setViewMode('chat');
  };

  const handleBackToList = () => {
    setViewMode('list');
    atualizarConversas();
    atualizarContadorNaoLidas();
  };

  const handleNovaConversa = async (empresaId) => {
    try {
      const conversa = await novaConversa(empresaId);
      await abrirConversa(conversa);
      setViewMode('chat');
      setShowNovaConversaModal(false);
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
    }
  };

  // Determinar se deve mostrar sidebar ou chat full
  const showSidebar = window.innerWidth > 768 || viewMode === 'list';
  const showChat = window.innerWidth > 768 || viewMode === 'chat';

  return (
    <div className="chat-page">
      <NavBar />
      <div className="chat-page-container">
        <div className="chat-container">
          {(showSidebar || !showChat) && (
            <div className="chat-sidebar">
              <div className="chat-sidebar-header">
                <h2>💬 Minhas Conversas</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {mensagensNaoLidas > 0 && (
                    <span className="chat-badge-notification">
                      {mensagensNaoLidas}
                    </span>
                  )}
                  <button
                    onClick={() => setShowNovaConversaModal(true)}
                    className="nova-conversa-button"
                    title="Nova conversa"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              {loading && conversas.length === 0 ? (
                <div className="chat-loading">
                  <div className="chat-spinner"></div>
                  <p>Carregando conversas...</p>
                </div>
              ) : error ? (
                <div className="chat-error">
                  <p>Erro ao carregar conversas: {error}</p>
                  <button onClick={atualizarConversas} className="chat-retry-button">
                    Tentar novamente
                  </button>
                </div>
              ) : (
                        <ConversasList
                          conversas={conversas}
                          conversaAtual={conversaAtual}
                          onSelectConversa={handleSelectConversa}
                          mensagensNaoLidas={mensagensNaoLidas}
                          naoLidasPorConversa={naoLidasPorConversa}
                        />
              )}
            </div>
          )}

          {showChat && (
            <div className="chat-main">
              {conversaAtual ? (
                <ChatWindow
                  conversa={conversaAtual}
                  mensagens={mensagens}
                  enviarMensagem={enviarMensagem}
                  onBack={handleBackToList}
                />
              ) : (
                <div className="chat-window-empty">
                  <p>Selecione uma conversa para começar</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <NovaConversaModal
        isOpen={showNovaConversaModal}
        onClose={() => setShowNovaConversaModal(false)}
        onSelectEmpresa={handleNovaConversa}
      />
      
      <Footer />
    </div>
  );
}

export default ChatPage;

