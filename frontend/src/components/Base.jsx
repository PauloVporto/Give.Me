import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
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
} from "react-icons/fi";

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

  const getActiveTab = () => {
    const path = location.pathname || "";
    // favorites -> index 0, profile (and nested) -> index 1
    if (path === "/favorites" || path.startsWith("/favorites/")) return 0;
    if (path === "/profile" || path.startsWith("/profile/")) return 1;
    // otherwise no tab selected
    return false;
  };

  const handleTabChange = (_, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/favorites");
        break;
      case 1:
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
          backgroundColor: "#e7fff1dc",
          color: "#222",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
                color: "#222",
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
                    backgroundColor: "#f5f5f5",
                    transition: "all 0.2s",
                    "& fieldset": { border: "none" },
                    "&:hover": { backgroundColor: "#eeeeee" },
                    "&.Mui-focused": {
                      backgroundColor: "#fff",
                      boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
                      "& fieldset": { border: "1px solid #22c55e" },
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
            <Tabs
              value={getActiveTab()}
              onChange={handleTabChange}
              sx={{
                mr: 1,
                "& .MuiTab-root": {
                  minHeight: "64px",
                  color: "#666",
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  minWidth: "90px",
                },
                "& .Mui-selected": { color: "#28a745 !important", fontWeight: 600 },
                "& .MuiTabs-indicator": { backgroundColor: "#28a745", height: 3 },
              }}
            >
              <Tab icon={<FiHeart size={18} />} iconPosition="start" label="Favoritos" />
              <Tab icon={<FiUser size={18} />} iconPosition="start" label="Perfil" />
            </Tabs>

            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={() => navigate("/create-item")}
              sx={{
                bgcolor: "#22c55e",
                color: "white",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                px: 2.5,
                height: 44,
                "&:hover": { bgcolor: "#16a34a" },
                boxShadow: "0 2px 8px rgba(34,197,94,0.2)",
              }}
            >
              Adicionar
            </Button>

            {/* small-screen add button kept for responsive layouts */}
            <IconButton
              onClick={() => navigate("/create-item")}
              sx={{
                display: { xs: "flex", sm: "none" },
                bgcolor: "#22c55e",
                color: "white",
                "&:hover": { bgcolor: "#16a34a" },
              }}
            >
              <FiPlus size={20} />
            </IconButton>

            {/* Cart button removed visually but kept commented for future use */}
            {/*
            <IconButton aria-label="carrinho" sx={{ color: "#222" }}>
              <FiShoppingCart size={22} />
            </IconButton>
            */}
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
