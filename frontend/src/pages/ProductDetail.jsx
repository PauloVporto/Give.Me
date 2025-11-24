// ProductDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api, { chatAPI } from "../api";
import { ACCESS_TOKEN } from "../constants";
import { useAlert } from "../contexts/AlertContext";
import {
  Box,
  Typography,
  Button,
  CardMedia,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, LocationOn, ChatBubbleOutline } from "@mui/icons-material";
import { fullUrl, Navbar } from "../components/Base";

function SmallImage({ src, alt, onClick, selected }) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onClick={onClick}
      sx={{
        width: 80,
        height: 80,
        objectFit: "cover",
        borderRadius: 1.5,
        cursor: "pointer",
        border: selected ? "3px solid" : "2px solid",
        borderColor: selected ? "primary.main" : "grey.300",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          transform: "scale(1.05)",
        }
      }}
    />
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const isAuthenticated = useMemo(() => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      return !!token && !!jwtDecode(token);
    } catch {
      return false;
    }
  }, []);

  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded?.user_id || decoded?.sub || decoded?.id || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/items/${slug}/`);
        if (mounted) setItem(res.data);
      } catch (e) {
        console.error("Erro ao buscar item:", e.response || e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [slug]);

  const isOwner = useMemo(() => {
    if (!item || !currentUserId) return false;
    const ownerId = item.owner_id || item.user_id || item.seller_id || item?.owner?.id || item?.seller?.id;
    return ownerId && String(ownerId) === String(currentUserId);
  }, [item, currentUserId]);

  const { showWarning, showError, showSuccess } = useAlert();

  const handleChatStart = async () => {
    if (!item?.owner_supabase_user_id) {
      showWarning("O vendedor ainda não configurou o perfil para chat. Tente novamente mais tarde.");
      return;
    }

    try {
      const conversation = await chatAPI.createConversation(item.owner_supabase_user_id);
      showSuccess("Conversa iniciada com sucesso!");
      navigate(`/chat?conversation=${conversation.id}`);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      
      if (error.response?.status === 400) {
        showError("Você precisa vincular seu perfil ao Supabase antes de usar o chat.");
      } else {
        showError("Erro ao iniciar conversa. Tente novamente.");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", px: 2 }}>
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="h6">Item não encontrado</Typography>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
            Voltar
          </Button>
        </Box>
      </Box>
    );
  }

  const images = (item.images || item.photos || []).map((img) => fullUrl(img));
  const placeholder = "/ImagEtc/SemFoto.png";

  const mainImage = images.length > 0 ? images[selectedImage] || images[0] : placeholder;

  return (
    <>
      <Navbar />
      <Box sx={{ 
        bgcolor: "background.default", 
        minHeight: '100vh',
        display: 'flex',
        position: 'relative'
      }}>
        {/* Left: Images */}
        <Box sx={{
          flex: 1,
          bgcolor: "background.paper",
          minHeight: '100vh',
          pr: '420px'
        }}>
          {/* Main Image Container */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 600,
              overflow: "hidden",
              backgroundColor: "#000",
              borderBottom: "1px solid #222",
            }}
          >
            <CardMedia
              component="img"
              image={mainImage}
              alt={item.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Small Image Gallery */}
          <Box sx={{ display: "flex", gap: 1, p: 2, borderTop: 1, borderColor: "divider", overflowX: "auto" }}>
            {images.slice(0, 8).map((src, idx) => (
              <SmallImage key={idx} src={src} alt={`${item.title} ${idx}`} onClick={() => setSelectedImage(idx)} selected={idx === selectedImage} />
            ))}
          </Box>
        </Box>

        {/* Right: Details - Fixed sidebar */}
        <Box sx={{
          position: 'fixed',
          right: 0,
          top: '64px',
          width: '400px',
          height: 'calc(100vh - 64px)',
          bgcolor: "background.paper",
          borderLeft: 1,
          borderColor: "divider",
          overflowY: 'auto',
          zIndex: 1000
        }}>
          <Box sx={{ px: 3, py: 3 }}>
            {/* Title and Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{item.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {item.city ? `${item.city.name} - ${item.city.state}` : '—'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Publicado em {new Date(item.created_at || Date.now()).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Chip
                  label={item.type === 'Sell' ? 'Venda' : item.type === 'Donation' ? 'Doação' : 'Troca'}
                  sx={{
                    fontWeight: 600,
                    bgcolor: '#ecfdf5',
                    color: '#027B55',
                    border: '1px solid #caf1e3'
                  }}
                />
              </Box>
            </Box>

            {/* Description */}
            {item.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Descrição</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {item.description}
                </Typography>
              </Box>
            )}

            {/* Condition and Category */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1, bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Condição</Typography>
                <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: 600 }}>
                  {item.status === 'new' ? 'Novo' : 'Usado'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#f8f9fa', p: 2, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Categoria</Typography>
                <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: 600 }}>
                  {item.category_name || item.category || '—'}
                </Typography>
              </Box>
            </Box>

            {/* Exchange interests - only for Trade items */}
            {item.type === 'Trade' && item.trade_interest && (
              <Box sx={{ mb: 3, bgcolor: '#ecfdf5', p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Interesses de troca</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, color: '#085d45' }}>
                  {item.trade_interest}
                </Typography>
              </Box>
            )}

            {/* Price - only for Sell items */}
            {item.type === 'Sell' && (
              <Box sx={{ mb: 3, bgcolor: '#e6f7f0', p: 2.5, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, color: '#009959' }}>Preço</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#009959' }}>
                  {item.price ? (
                    `R$ ${parseFloat(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  ) : (
                    'Preço não informado'
                  )}
                </Typography>
              </Box>
            )}

            {/* Seller info */}
            <Box sx={{
              mb: 3,
              bgcolor: '#ecfdf5',
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Box sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{
                  mb: 2,
                  color: '#027B55',
                  fontWeight: 500
                }}>
                  Anunciado por
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{
                    bgcolor: '#e6e8ea',
                    color: '#637381',
                    width: 48,
                    height: 48
                  }}>
                    {item.user?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {item.user || 'Usuário'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Membro desde {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  startIcon={<ChatBubbleOutline />}
                  disabled={!isAuthenticated || isOwner}
                  onClick={handleChatStart}
                  sx={{
                    bgcolor: '#007a55',
                    '&:hover': {
                      bgcolor: '#006845'
                    },
                    textTransform: 'none',
                    height: 48
                  }}
                >
                  Iniciar Conversa
                </Button>
              </Box>

              <Box sx={{
                bgcolor: '#ffffff',
                borderTop: '1px solid #caf1e3',
                p: 2,
                textAlign: 'center'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Use nosso chat para negociar com segurança
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                ID do anúncio: {item.id}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
