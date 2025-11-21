import React from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { FiSend } from "react-icons/fi";

export default function MessageInput({ 
  message, 
  onChange, 
  onSubmit, 
  disabled, 
  sending 
}) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        p: 2,
        borderTop: "1px solid #E4E6EB",
        backgroundColor: "#F0F2F5",
        display: "flex",
        gap: 1,
        alignItems: "center",
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Digite uma mensagem..."
        value={message}
        onChange={onChange}
        disabled={disabled || sending}
        multiline
        maxRows={4}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "24px",
            backgroundColor: "#FFFFFF",
            fontSize: "0.95rem",
            "& fieldset": {
              borderColor: "#E4E6EB",
            },
            "&:hover fieldset": {
              borderColor: "#009959ff",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#009959ff",
              borderWidth: "1px",
            },
          },
        }}
      />
      <IconButton
        type="submit"
        disabled={!message.trim() || sending}
        sx={{
          backgroundColor: "#009959ff",
          color: "#fff",
          width: 48,
          height: 48,
          "&:hover": {
            backgroundColor: "#128C7E",
          },
          "&:disabled": {
            backgroundColor: "#E4E6EB",
            color: "#BCC0C4",
          },
        }}
      >
        {sending ? (
          <CircularProgress size={20} sx={{ color: "#fff" }} />
        ) : (
          <FiSend size={20} />
        )}
      </IconButton>
    </Box>
  );
}
