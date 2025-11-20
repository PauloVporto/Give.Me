import React, { createContext, useContext, useState } from "react";
import Alert from "../components/Alert";

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert deve ser usado dentro de AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info"
  });

  const showAlert = (message, severity = "info") => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const showSuccess = (message) => showAlert(message, "success");
  const showError = (message) => showAlert(message, "error");
  const showWarning = (message) => showAlert(message, "warning");
  const showInfo = (message) => showAlert(message, "info");

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, showSuccess, showError, showWarning, showInfo }}>
      {children}
      <Alert
        open={alert.open}
        onClose={hideAlert}
        message={alert.message}
        severity={alert.severity}
      />
    </AlertContext.Provider>
  );
};
