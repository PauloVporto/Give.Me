import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import {
  FiArrowLeft,
  FiSearch,
  FiHeart,
  FiUser,
  FiHome,
  FiShoppingCart,
  FiPlus,
  FiCodesandbox,
  FiMessageCircle,
} from "react-icons/fi";
import { ACCESS_TOKEN } from "../constants";

/* -------------------------------------------------------------------------- */
/*                               CONFIG GERAL                                 */
/* -------------------------------------------------------------------------- */
export const BASE_URL = "http://localhost:8000";

export function fullUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return `${BASE_URL}${u}`;
  return `${BASE_URL}/${u}`;
}

/* -------------------------------------------------------------------------- */
/*                               NAV SUPERIOR                                 */
/* -------------------------------------------------------------------------- */
export function TopNav({ activePage = "home", onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");

  // Verificar se o usuário está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    return !!token;
  });

  // Atualizar isAuthenticated quando a localização mudar (após login/logout)
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  const getActiveTab = () => {
    const path = location.pathname || "";
    // chat -> index 0, favorites -> index 1, profile -> index 2
    if (path === "/chat" || path.startsWith("/chat/")) return 0;
    if (path === "/favorites" || path.startsWith("/favorites/")) return 1;
    if (path === "/profile" || path.startsWith("/profile/")) return 2;
    return false;
  };

  const handleTabChange = (_, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/chat");
        break;
      case 1:
        navigate("/favorites");
        break;
      case 2:
        navigate("/profile");
        break;
      default:
        break;
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    if (onSearch) onSearch(value);
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter" && searchValue.trim()) {
      if (onSearch) onSearch(searchValue);
    }
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#3cdf62ff",
          color: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          top: 0,
          zIndex: 1100,
        }}
      >
        <Toolbar sx={{ px: 0, display: "flex", justifyContent: "space-between" }}>
          {/* LEFT CONTAINER: constrained width for logo + search */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              maxWidth: "1280px",
              width: "100%",
              px: { xs: 1, md: 3 },
            }}
          >
            {/* LOGO */}
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
                mr: 0,
                flexShrink: 0,
              }}
            >
              Give.me
            </Typography>

            {/* BARRA DE PESQUISA */}
            <Box sx={{ flexGrow: 1, maxWidth: "500px", mx: 2, display: { xs: "none", md: "block" } }}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Buscar itens..."
                value={searchValue}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    backgroundColor: "#fff",
                    transition: "all 0.2s",
                    "& fieldset": { border: "1px solid rgba(0,0,0,0.1)" },
                    "&:hover": { 
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      "& fieldset": { border: "1px solid rgba(0,0,0,0.2)" },
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#fff",
                      boxShadow: "0 0 0 3px rgba(0,0,0,0.1)",
                      "& fieldset": { border: "2px solid rgba(0,0,0,0.3)" },
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FiSearch size={18} style={{ color: "#666" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* RIGHT ACTIONS: kept outside the constrained left container so it can sit flush to the right edge */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", pr: { xs: 1, md: 3 } }}>
            {isAuthenticated ? (
              <>
                {/* HEADER PARA USUÁRIOS LOGADOS */}
                <Tabs
                  value={getActiveTab()}
                  onChange={handleTabChange}
                  sx={{
                    mr: 1,
                    "& .MuiTab-root": {
                      minHeight: "44px",
                      height: "44px",
                      color: "rgba(255,255,255,0.8)",
                      fontWeight: 500,
                      textTransform: "none",
                      fontSize: "0.95rem",
                      minWidth: "90px",
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        color: "#fff",
                        backgroundColor: "rgba(255,255,255,0.5)",
                        transform: "translateY(-2px)",
                      },
                    },
                    "& .Mui-selected": { 
                      color: "#fff !important", 
                      fontWeight: 600,
                      backgroundColor: "rgba(255,255,255,0.15)",
                    },
                    "& .MuiTabs-indicator": { backgroundColor: "#fff", height: 3 },
                  }}
                >
                  <Tab icon={<FiMessageCircle size={18} />} iconPosition="start" label="Chat" />
                  <Tab icon={<FiHeart size={18} />} iconPosition="start" label="Favoritos" />
                  <Tab icon={<FiUser size={18} />} iconPosition="start" label="Perfil" />
                </Tabs>

                <Button
                  variant="contained"
                  startIcon={<FiPlus />}
                  onClick={() => navigate("/create-item")}
                  sx={{
                    bgcolor: "#fff",
                    color: "#28a745",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 2.5,
                    height: 44,
                    transition: "all 0.3s ease",
                    "&:hover": { 
                      bgcolor: "#f0f0f0",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    },
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  Adicionar
                </Button>

                {/* small-screen add button kept for responsive layouts */}
                <IconButton
                  onClick={() => navigate("/create-item")}
                  sx={{
                    display: { xs: "flex", sm: "none" },
                    bgcolor: "#fff",
                    color: "#28a745",
                    transition: "all 0.3s ease",
                    "&:hover": { 
                      bgcolor: "#f0f0f0",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <FiPlus size={20} />
                </IconButton>
              </>
            ) : (
              <>
                {/* HEADER PARA USUÁRIOS NÃO LOGADOS */}
                <Button
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  sx={{
                    bgcolor: "transparent",
                    color: "#fff",
                    borderColor: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 3,
                    height: 44,
                    transition: "all 0.3s ease",
                    "&:hover": { 
                      bgcolor: "rgba(255,255,255,0.1)",
                      borderColor: "#fff",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Entrar
                </Button>

                <Button
                  variant="contained"
                  onClick={() => navigate("/register")}
                  sx={{
                    bgcolor: "#fff",
                    color: "#28a745",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "10px",
                    px: 3,
                    height: 44,
                    transition: "all 0.3s ease",
                    "&:hover": { 
                      bgcolor: "#f0f0f0",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                    },
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  Cadastrar
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Espaço para empurrar o conteúdo pra baixo */}
      <Box sx={{ height: { xs: "120px", md: "80px" } }} />
    </>
  );
}

export function Navbar({ activePage = "home" }) {
  return <TopNav activePage={activePage} />;
}

/* -------------------------------------------------------------------------- */
/*                            CABEÇALHO VOLTAR                                */
/* -------------------------------------------------------------------------- */
export function BackHeader({ title, rightElement, onBack }) {
  const navigate = useNavigate();
  const handleBack = () => (onBack ? onBack() : navigate(-1));

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, mt: 2 }}>
      <IconButton
        onClick={handleBack}
        aria-label="voltar"
        sx={{
          color: "#222",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
        }}
      >
        <FiArrowLeft size={24} />
      </IconButton>

      {title && (
        <Typography
          variant="h5"
          component="h2"
          sx={{
            flexGrow: 1,
            textAlign: "center",
            fontWeight: 600,
            color: "#222",
          }}
        >
          {title}
        </Typography>
      )}

      {rightElement && <Box sx={{ ml: "auto" }}>{rightElement}</Box>}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CONTAINERS                                    */
/* -------------------------------------------------------------------------- */
export function PageContainer({ children }) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1280px",
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: 3,
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/*                           COMPONENTES AUXILIARES                           */
/* -------------------------------------------------------------------------- */
export function LoadingContainer({ message = "Carregando..." }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 3, minHeight: "200px", gap: 2 }}>
      <CircularProgress sx={{ color: "#28a745" }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export function EmptyState({ message = "Nenhum item encontrado" }) {
  return (
    <Box sx={{ textAlign: "center", padding: 5, color: "#999" }}>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/*                           ESTILOS COMPARTILHADOS                           */
/* -------------------------------------------------------------------------- */
export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#333",
  outline: "none",
};

export const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "#777",
  marginBottom: 6,
};

export const buttonStyle = {
  border: "1px solid #ddd",
  background: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  color: "#333",
};

export const primaryButtonStyle = {
  ...buttonStyle,
  background: "#28a745",
  color: "#fff",
  border: "none",
  fontWeight: 600,
};
