import React from "react";
import { Snackbar, Alert as MuiAlert, Slide } from "@mui/material";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle } from "react-icons/fi";

function SlideTransition(props) {
  return <Slide {...props} direction="down" />;
}

export default function Alert({ 
  open, 
  onClose, 
  message, 
  severity = "info",
  autoHideDuration = 4000 
}) {
  const icons = {
    success: <FiCheckCircle size={20} />,
    error: <FiXCircle size={20} />,
    warning: <FiAlertCircle size={20} />,
    info: <FiInfo size={20} />
  };

  const colors = {
    success: {
      bg: "#e7fff1",
      text: "#027B55",
      border: "#28a745"
    },
    error: {
      bg: "#ffebee",
      text: "#c62828",
      border: "#e53935"
    },
    warning: {
      bg: "#fff8e1",
      text: "#f57c00",
      border: "#ff9800"
    },
    info: {
      bg: "#e3f2fd",
      text: "#1565c0",
      border: "#2196f3"
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: 80 }}
    >
      <MuiAlert
        onClose={onClose}
        severity={severity}
        variant="filled"
        icon={icons[severity]}
        sx={{
          backgroundColor: colors[severity].bg,
          color: colors[severity].text,
          border: `2px solid ${colors[severity].border}`,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          minWidth: 300,
          fontWeight: 500,
          fontSize: "0.95rem",
          "& .MuiAlert-icon": {
            color: colors[severity].border,
          },
          "& .MuiAlert-action": {
            color: colors[severity].text,
          }
        }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
}
