import React from "react";
import { Box, Typography, Avatar, IconButton } from "@mui/material";
import { FiArrowLeft } from "react-icons/fi";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatWindow({
  conversation,
  userName,
  messages,
  currentUserId,
  newMessage,
  onMessageChange,
  onSendMessage,
  sendingMessage,
  onBack,
  showBackButton = false,
}) {
  if (!conversation) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#999",
        }}
      >
        <Typography variant="body1">
          Selecione uma conversa para começar
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Header da conversa */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid #E4E6EB",
          backgroundColor: "#F0F2F5",
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {showBackButton && (
          <IconButton 
            onClick={onBack}
            sx={{
              color: "#54656f",
              "&:hover": {
                backgroundColor: "#E4E6EB",
              },
            }}
          >
            <FiArrowLeft size={24} />
          </IconButton>
        )}
        <Avatar 
          sx={{ 
            bgcolor: "#009959ff",
            width: 45,
            height: 45,
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: "1.1rem",
              color: "#000",
            }}
          >
            {userName}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: "#667781",
              fontSize: "0.8rem",
            }}
          >
            Clique para ver detalhes
          </Typography>
        </Box>
      </Box>

      {/* Mensagens */}
      <Box
        id="messages-container"
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          backgroundColor: "#F0F2F5",
          backgroundImage: `linear-gradient(to bottom, rgba(240, 242, 245, 0.95), rgba(240, 242, 245, 0.95)), 
                           repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.02) 10px, rgba(0,0,0,.02) 20px)`,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#999",
            }}
          >
            <Typography variant="body2">
              Nenhuma mensagem ainda. Comece a conversa!
            </Typography>
          </Box>
        ) : (
          messages.map((msg) => {
            const isMyMessage = String(msg.sender_id) === String(currentUserId);
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMyMessage={isMyMessage}
              />
            );
          })
        )}
      </Box>

      {/* Input de mensagem */}
      <MessageInput
        message={newMessage}
        onChange={onMessageChange}
        onSubmit={onSendMessage}
        sending={sendingMessage}
      />
    </>
  );
}
