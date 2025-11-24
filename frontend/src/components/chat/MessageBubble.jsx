import React from "react";
import { Box, Paper, Typography } from "@mui/material";

export default function MessageBubble({ message, isMyMessage }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMyMessage ? "flex-end" : "flex-start",
        mb: 1.5,
        px: 1,
      }}
    >
      <Paper
        elevation={isMyMessage ? 2 : 0}
        sx={{
          maxWidth: "70%",
          p: 1.5,
          borderRadius: isMyMessage ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          backgroundColor: isMyMessage ? "#009959ff" : "#FFFFFF",
          color: isMyMessage ? "#FFFFFF" : "#000000",
          border: isMyMessage ? "none" : "1px solid #E4E6EB",
          boxShadow: isMyMessage 
            ? "0 1px 3px rgba(37, 211, 102, 0.3)" 
            : "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ 
            wordBreak: "break-word",
            fontSize: "0.95rem",
            lineHeight: 1.4,
          }}
        >
          {message.body}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            opacity: isMyMessage ? 0.85 : 0.6,
            fontSize: "0.7rem",
            textAlign: "right",
          }}
        >
          {new Date(message.sent_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Paper>
    </Box>
  );
}
