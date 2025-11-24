import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  List,
  Divider,
  IconButton,
} from "@mui/material";
import { FiArrowLeft } from "react-icons/fi";
import { Navbar, LoadingContainer, EmptyState } from "../components/Base";
import { chatAPI } from "../api";
import api from "../api";
import ConversationItem from "../components/chat/ConversationItem";
import ChatWindow from "../components/chat/ChatWindow";
import { subscribeToMessages, unsubscribeFromMessages } from "../supabaseClient";

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados principais
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const subscriptionRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await api.get("/users/profile/");
        setCurrentUserId(data?.supabase_user_id);
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Buscar conversas do usuário
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await chatAPI.getConversations();
        setConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar conversas:", error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]);
    
    if (subscriptionRef.current) {
      await unsubscribeFromMessages(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    try {
      const messagesData = await chatAPI.getMessages(conversation.id);
      setMessages(Array.isArray(messagesData) ? messagesData.reverse() : []);
      
      subscriptionRef.current = subscribeToMessages(conversation.id, (newMsg) => {
        console.log('[Chat] Nova mensagem recebida via Realtime:', newMsg);
        setMessages(prev => {
          const exists = prev.some(m => m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
        
        setTimeout(() => {
          const container = document.getElementById("messages-container");
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      });
      
    } catch (error) {
      console.error("Erro ao buscar mensagens:", error);
      setMessages([]);
    }
  };
  
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromMessages(subscriptionRef.current);
      }
    };
  }, []);

  // Enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setSendingMessage(true);
      const sentMessage = await chatAPI.sendMessage(
        selectedConversation.id,
        newMessage.trim()
      );
      
      // Adicionar mensagem na lista
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
      
      // Scroll para o final
      setTimeout(() => {
        const container = document.getElementById("messages-container");
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Função auxiliar para pegar o nome do outro usuário
  const getOtherUserName = (conversation) => {
    return conversation.other_user_name || "Usuário";
  };

  // Renderizar lista de conversas
  const renderConversationsList = () => {
    if (loading) {
      return <LoadingContainer message="Carregando conversas..." />;
    }

    if (conversations.length === 0) {
      return (
        <EmptyState message="Você ainda não tem conversas. Clique em 'Conversar' em um produto para iniciar!" />
      );
    }

    return (
      <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
        {conversations.map((conv, index) => (
          <React.Fragment key={conv.id}>
            <ConversationItem
              conversation={conv}
              userName={getOtherUserName(conv)}
              isSelected={selectedConversation?.id === conv.id}
              onClick={() => handleSelectConversation(conv)}
            />
            {index < conversations.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Navbar activePage="chat" />
      
      <Box
        sx={{
          maxWidth: "1280px",
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: 3,
          minHeight: "calc(100vh - 120px)",
        }}
      >
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
          <IconButton onClick={() => navigate("/")} sx={{ color: "#28a745" }}>
            <FiArrowLeft size={24} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#333" }}>
            Mensagens
          </Typography>
        </Box>

        {/* Container principal */}
        <Paper
          elevation={2}
          sx={{
            height: "calc(100vh - 220px)",
            minHeight: "500px",
            display: "flex",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* Lista de conversas (esquerda) */}
          <Box
            sx={{
              width: { xs: "100%", md: "350px" },
              borderRight: { md: "1px solid #e0e0e0" },
              display: { xs: selectedConversation ? "none" : "block", md: "block" },
              overflowY: "auto",
            }}
          >
            {renderConversationsList()}
          </Box>

          {/* Área de mensagens (direita) */}
          <Box
            sx={{
              flex: 1,
              display: { xs: selectedConversation ? "flex" : "none", md: "flex" },
              flexDirection: "column",
            }}
          >
            <ChatWindow
              conversation={selectedConversation}
              userName={selectedConversation ? getOtherUserName(selectedConversation) : ""}
              messages={messages}
              currentUserId={currentUserId}
              newMessage={newMessage}
              onMessageChange={(e) => setNewMessage(e.target.value)}
              onSendMessage={handleSendMessage}
              sendingMessage={sendingMessage}
              onBack={() => setSelectedConversation(null)}
              showBackButton={true}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
