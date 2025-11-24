import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from "@mui/material";

export default function ConversationItem({ 
  conversation, 
  userName, 
  isSelected, 
  onClick 
}) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        selected={isSelected}
        sx={{
          py: 2,
          "&.Mui-selected": {
            backgroundColor: "#F0F2F5",
            borderLeft: "4px solid #009959ff",
          },
          "&:hover": {
            backgroundColor: "#F5F5F5",
          },
        }}
      >
        <ListItemAvatar>
          <Avatar 
            sx={{ 
              bgcolor: "#009959ff",
              width: 50,
              height: 50,
              fontSize: "1.2rem",
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography 
              sx={{ 
                fontWeight: isSelected ? 600 : 500,
                fontSize: "1rem",
                color: "#000",
              }}
            >
              {userName}
            </Typography>
          }
          secondary={
            <Typography 
              variant="body2" 
              sx={{ 
                color: "#667781",
                fontSize: "0.875rem",
                mt: 0.5,
              }}
            >
              {conversation.last_message_at
                ? new Date(conversation.last_message_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "Nova conversa"}
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}
