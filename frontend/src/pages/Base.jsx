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
  Paper,
  Button,
  Container,
  Tabs,
  Tab
} from "@mui/material";
import { 
  FiArrowLeft, 
  FiSearch, 
  FiHeart, 
  FiUser, 
  FiHome, 
  FiShoppingCart,
  FiPlus,
  FiSquare,
  FiPlusSquare,
  FiDivideSquare,
  FiXSquare,
  FiBox,
  FiCodesandbox,
  FiInbox
} from "react-icons/fi";

// Constante base para URLs de imagens
export const BASE_URL = "http://localhost:8000";

// Função utilitária para construir URLs completas
export function fullUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return `${BASE_URL}${u}`;
  return `${BASE_URL}/${u}`;
}

// Componente de navegação no topo (Top Nav)
export function TopNav({ activePage = "home", onSearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");

  const getActiveTab = () => {
    switch(location.pathname) {
      case "/": return 0;
      case "/search": return 1;
      case "/favorites": return 2;
      case "/profile": return 3;
      default: return 0;
    }
  };

  const handleTabChange = (event, newValue) => {
    switch(newValue) {
      case 0: navigate("/"); break;
      case 1: navigate("/search"); break;
      case 2: navigate("/favorites"); break;
      case 3: navigate("/profile"); break;
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter' && searchValue.trim()) {
      if (onSearch) {
        onSearch(searchValue);
      }
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        backgroundColor: '#fff',
        color: '#222',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        top: 0,
        zIndex: 1100
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, sm: 2 } }}>
          {/* Logo */}
          <Typography 
            variant="h5" 
            component={Link}
            to="/"
            sx={{ 
              fontWeight: 700,
              color: '#222',
              textDecoration: 'none',
              mr: 4,
              flexShrink: 0
            }}
          >
            Give.me
          </Typography>
          
          {/* Search Bar */}
          <Box sx={{ flexGrow: 1, maxWidth: '500px', mx: 2, display: { xs: 'none', md: 'block' } }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Buscar itens..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: '#f5f5f5',
                  transition: 'all 0.2s',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#eeeeee',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px rgba(34,197,94,0.2)',
                    '& fieldset': {
                      border: '1px solid #22c55e',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch size={18} style={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          {/* Navigation Tabs */}
          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            <Tabs 
              value={getActiveTab()} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  minHeight: '64px',
                  color: '#666',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  minWidth: '90px',
                },
                '& .Mui-selected': {
                  color: '#28a745 !important',
                  fontWeight: 600,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#28a745',
                  height: 3,
                },
              }}
            >
              <Tab 
                icon={<FiHome size={18} />} 
                iconPosition="start" 
                label="Home" 
              />
              <Tab 
                icon={<FiCodesandbox size={18} />} 
                iconPosition="start" 
                label="Meus Itens" 
              />
              <Tab 
                icon={<FiHeart size={18} />} 
                iconPosition="start" 
                label="Favoritos" 
              />
              <Tab 
                icon={<FiUser size={18} />} 
                iconPosition="start" 
                label="Perfil" 
              />
            </Tabs>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<FiPlus />}
              onClick={() => navigate("/create-item")}
              sx={{
                bgcolor: '#22c55e',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '10px',
                px: 2.5,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': {
                  bgcolor: '#16a34a',
                },
                boxShadow: '0 2px 8px rgba(34,197,94,0.2)',
              }}
            >
              Adicionar
            </Button>

            <IconButton 
              onClick={() => navigate("/create-item")}
              sx={{ 
                display: { xs: 'flex', sm: 'none' },
                bgcolor: '#22c55e',
                color: 'white',
                '&:hover': {
                  bgcolor: '#16a34a',
                },
              }}
            >
              <FiPlus size={20} />
            </IconButton>
            
            <IconButton 
              aria-label="carrinho"
              sx={{ color: '#222' }}
            >
              <FiShoppingCart size={22} />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, pb: 1, flexDirection: 'column', gap: 1 }}>
          {/* Mobile Search Bar */}
          <Box sx={{ px: 2 }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Buscar itens..."
              value={searchValue}
              onChange={handleSearchChange}
              onKeyPress={handleSearchKeyPress}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  backgroundColor: '#f5f5f5',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '#eeeeee',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fff',
                    boxShadow: '0 0 0 2px rgba(34,197,94,0.2)',
                    '& fieldset': {
                      border: '1px solid #22c55e',
                    },
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch size={18} style={{ color: '#666' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Tabs 
            value={getActiveTab()} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              width: '100%',
              '& .MuiTab-root': {
                minHeight: '48px',
                color: '#666',
                fontSize: '0.75rem',
                minWidth: 0,
              },
              '& .Mui-selected': {
                color: '#28a745 !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#28a745',
              },
            }}
          >
            <Tab icon={<FiHome size={20} />} />
            <Tab icon={<FiSearch size={20} />} />
            <Tab icon={<FiHeart size={20} />} />
            <Tab icon={<FiUser size={20} />} />
          </Tabs>
        </Box>
      </Container>
    </AppBar>
  );
}

// Mantém BottomNav para compatibilidade, mas agora chama TopNav
export function BottomNav({ activePage = "home" }) {
  return <TopNav activePage={activePage} />;
}

// Componente de Header com botão de voltar (simplificado para web)
export function BackHeader({ title, rightElement, onBack }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
        mt: 2
      }}
    >
      <IconButton 
        onClick={handleBack}
        aria-label="voltar"
        sx={{ 
          color: '#222',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.04)'
          }
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
            textAlign: 'center',
            fontWeight: 600,
            color: '#222'
          }}
        >
          {title}
        </Typography>
      )}
      
      {rightElement && (
        <Box sx={{ ml: 'auto' }}>
          {rightElement}
        </Box>
      )}
    </Box>
  );
}

// Componente de Header principal - removido pois agora é TopNav
// Mantido para compatibilidade
export function MainHeader({ onAddClick }) {
  return null; // Funcionalidade movida para TopNav
}

// Componente de busca (usado na Home)
export function SearchBar({ placeholder = "What are you looking for?", onSearch }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      onChange={(e) => onSearch && onSearch(e.target.value)}
      sx={{
        mb: 3,
        maxWidth: '600px',
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: '#f0f7f0',
          '& fieldset': {
            border: 'none',
          },
          '&:hover fieldset': {
            border: 'none',
          },
          '&.Mui-focused fieldset': {
            border: '1px solid #28a745',
          },
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FiSearch size={20} style={{ color: '#666' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

// Componente de Container para páginas
export function PageContainer({ children, maxWidth = "xl" }) {
  return (
    <>
      {/* Spacer para compensar navbar fixa */}
      <Box sx={{ height: { xs: '120px', md: '64px' } }} />
      <Container 
        maxWidth={maxWidth} 
        sx={{ 
          py: 3,
          minHeight: 'calc(100vh - 120px)'
        }}
      >
        {children}
      </Container>
    </>
  );
}

// Estilos comuns para inputs (mantido para compatibilidade)
export const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  color: "var(--text-dark)",
  outline: "none",
};

// Estilos comuns para labels (mantido para compatibilidade)
export const labelStyle = {
  display: "block",
  fontSize: 12,
  color: "var(--text-light)",
  marginBottom: 6,
};

// Estilos comuns para botões (mantido para compatibilidade)
export const buttonStyle = {
  border: "1px solid #ddd",
  background: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  color: "#333",
};

// Estilos para botão primário (mantido para compatibilidade)
export const primaryButtonStyle = {
  ...buttonStyle,
  background: "var(--main-green)",
  color: "#fff",
  border: "none",
  fontWeight: 600,
};

// Componente de container de loading
export function LoadingContainer({ message = "Carregando..." }) {
  return (
    <Box 
      sx={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        padding: 3,
        minHeight: "200px",
        gap: 2
      }}
    >
      <CircularProgress sx={{ color: '#28a745' }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

// Componente de mensagem vazia
export function EmptyState({ message = "Nenhum item encontrado" }) {
  return (
    <Box 
      sx={{ 
        textAlign: "center", 
        padding: 5,
        color: "#999"
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
