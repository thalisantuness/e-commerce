/**
 * Hook personalizado para gerenciar estado do chat e Socket.IO
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getAuthToken, getUserId } from '../services/authService';
import { listarConversas, listarMensagens, marcarMensagemComoLida, criarConversa } from '../services/chatService';
import { SOCKET_URL } from '../config/apiConfig';

export function useChat() {
  const [conversas, setConversas] = useState([]);
  const [conversaAtual, setConversaAtual] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);
  const [naoLidasPorConversa, setNaoLidasPorConversa] = useState({}); // { conversa_id: count }
  const socketRef = useRef(null);

  // Inicializar Socket.IO
  useEffect(() => {
    const token = getAuthToken();
    const userId = getUserId();
    if (!token || !userId) {
      // Se não estiver autenticado, não conectar ao socket
      return;
    }

    // Conectar ao socket
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Evento: Receber mensagem
    socketRef.current.on('receivedMessage', (mensagemData) => {
      console.log('📨 Mensagem recebida:', mensagemData);
      
      // Se a conversa atual está aberta, recarregar mensagens para garantir dados completos do remetente
      if (conversaAtual && mensagemData.conversa_id === conversaAtual.conversa_id) {
        // Recarregar mensagens da conversa para garantir que temos os dados completos do Remetente
        // Isso garante que nome e foto do remetente estejam presentes
        listarMensagens(conversaAtual.conversa_id)
          .then((mensagensCompletas) => {
            // Ordenar por data (mais antiga primeiro)
            const ordenadas = mensagensCompletas.sort((a, b) => 
              new Date(a.data_envio) - new Date(b.data_envio)
            );
            setMensagens(ordenadas);

            // Marcar como lida se não foi enviada por mim
            const userId = getUserId();
            if (mensagemData.remetente_id !== userId && !mensagemData.lida) {
              marcarMensagemComoLida(mensagemData.mensagem_id).catch(console.error);
            }
          })
          .catch(console.error);
      } else {
        // Se a conversa não está aberta, apenas atualizar contadores
        // Não adicionar mensagem ao estado se a conversa não está aberta
      }

      // Atualizar lista de conversas
      atualizarConversas();
      atualizarContadorNaoLidas();
    });

    // Evento: Erro
    socketRef.current.on('error', (errorData) => {
      console.error('❌ Erro no socket:', errorData);
      setError(errorData.message || 'Erro na conexão do chat');
    });

    // Evento: Conectado
    socketRef.current.on('connect', () => {
      console.log('✅ Conectado ao socket de chat');
      setError(null);
    });

    // Evento: Desconectado
    socketRef.current.on('disconnect', () => {
      console.log('⚠️ Desconectado do socket de chat');
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversaAtual]);

  // Carregar conversas
  const atualizarConversas = useCallback(async () => {
    const token = getAuthToken();
    const userId = getUserId();
    if (!token || !userId) {
      return; // Não fazer requisição se não estiver autenticado
    }

    try {
      setLoading(true);
      const data = await listarConversas();
      // Ordenar por última mensagem (mais recente primeiro)
      const ordenadas = data.sort((a, b) => 
        new Date(b.ultima_mensagem) - new Date(a.ultima_mensagem)
      );
      setConversas(ordenadas);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar mensagens de uma conversa
  const carregarMensagens = useCallback(async (conversaId) => {
    try {
      setLoading(true);
      const data = await listarMensagens(conversaId);
      // Ordenar por data (mais antiga primeiro)
      const ordenadas = data.sort((a, b) => 
        new Date(a.data_envio) - new Date(b.data_envio)
      );
      setMensagens(ordenadas);

      // Marcar mensagens não lidas como lidas
      const userId = getUserId();
      for (const msg of data) {
        if (!msg.lida && msg.remetente_id !== userId) {
          await marcarMensagemComoLida(msg.mensagem_id);
        }
      }

      atualizarContadorNaoLidas();
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar contador de mensagens não lidas
  const atualizarContadorNaoLidas = useCallback(async () => {
    const token = getAuthToken();
    const userId = getUserId();
    if (!token || !userId) {
      setMensagensNaoLidas(0);
      setNaoLidasPorConversa({});
      return; // Não fazer requisição se não estiver autenticado
    }

    try {
      const conversas = await listarConversas();
      let total = 0;
      const porConversa = {};

      for (const conversa of conversas) {
        const mensagens = await listarMensagens(conversa.conversa_id);
        const naoLidas = mensagens.filter(
          msg => !msg.lida && msg.remetente_id !== userId
        );
        const count = naoLidas.length;
        total += count;
        porConversa[conversa.conversa_id] = count;
      }

      setMensagensNaoLidas(total);
      setNaoLidasPorConversa(porConversa);
    } catch (err) {
      console.error('Erro ao contar mensagens não lidas:', err);
      setMensagensNaoLidas(0);
      setNaoLidasPorConversa({});
    }
  }, []);

  // Abrir conversa
  const abrirConversa = useCallback(async (conversa) => {
    setConversaAtual(conversa);
    await carregarMensagens(conversa.conversa_id);
  }, [carregarMensagens]);

  // Criar nova conversa
  const novaConversa = useCallback(async (destinatario_id) => {
    try {
      setLoading(true);
      const conversa = await criarConversa(destinatario_id);
      await atualizarConversas();
      await abrirConversa(conversa);
      return conversa;
    } catch (err) {
      console.error('Erro ao criar conversa:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [atualizarConversas, abrirConversa]);

  // Enviar mensagem via Socket.IO
  const enviarMensagem = useCallback((conteudo, destinatario_id) => {
    if (!socketRef.current || !socketRef.current.connected) {
      setError('Conexão com o servidor não estabelecida');
      return;
    }

    if (!conteudo.trim()) {
      setError('Mensagem não pode estar vazia');
      return;
    }

    socketRef.current.emit('sendMessage', {
      destinatario_id,
      conteudo: conteudo.trim()
    });
  }, []);

  // Carregar conversas ao montar (apenas se autenticado)
  useEffect(() => {
    const token = getAuthToken();
    const userId = getUserId();
    
    if (!token || !userId) {
      // Se não estiver autenticado, não carregar dados
      return;
    }

    atualizarConversas();
    atualizarContadorNaoLidas();
    
    // Atualizar contador periodicamente
    const interval = setInterval(() => {
      const currentToken = getAuthToken();
      const currentUserId = getUserId();
      if (currentToken && currentUserId) {
        atualizarContadorNaoLidas();
      }
    }, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, [atualizarConversas, atualizarContadorNaoLidas]);

  return {
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
  };
}

