// ProductDetail.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import {
  Box,
  Grid,
  Typography,
  Button,
  CardMedia,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Edit, LocationOn, ChatBubbleOutline } from "@mui/icons-material";
import { fullUrl, Navbar } from "../components/Base";

// Componente SmallImage - Mantido
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

  // Lógica de autenticação e busca de dados (Mantida)
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

  const handleChatStart = () => {
    console.log('Starting chat with seller');
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
  const mainImage = images[selectedImage] || images[0] || "/placeholder.png";

  return (
    <>
      {/* ⚠️ Nota: A Navbar deve ser fixa ou o Box abaixo deve cobrir a tela inteira (height: 100vh) se você quiser o efeito de coluna lateral fixa */}
      <Navbar />
      <Box sx={{ bgcolor: "background.default", minHeight: '100vh' }}>
        <Grid container>

          {/* Left: Images - md={7} (60% da largura em desktop) */}
          <Grid item xs={12} md={7}>
            <Box sx={{
              bgcolor: "background.paper",
              borderRight: { md: 1 },
              borderColor: "divider",
              width: '100%'
            }}>

              {/* Top Bar with Back/Edit */}
              <Box sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderBottom: { xs: 1, md: 0 },
                borderColor: "divider"
              }}>
                <IconButton onClick={() => navigate(-1)}>
                  <ArrowBack />
                </IconButton>
                <Box sx={{ flex: 1 }} />
                {isOwner && (
                  <Button component={Link} to={`/edit-item/${item.id}`} startIcon={<Edit />}>
                    Editar
                  </Button>
                )}
              </Box>

              {/* Main Image Container - Agora com foco na altura/centralização simples */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: { xs: 350, md: 600 },
                  overflow: "hidden",
                  backgroundColor: "#000", // fundo escuro deixa o foco na imagem
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
                    objectFit: "cover", // preenche o bloco cortando um pouco
                    borderRadius: 2,
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
          </Grid>

          {/* Right: Details - md={5} (40% da largura em desktop) */}
          <Grid item xs={12} md={5}>
            <Box sx={{
              bgcolor: "background.paper",
              px: { xs: 2, sm: 3 },
              py: { xs: 3 }
            }}>
              <Box sx={{ maxWidth: 480, margin: '0 auto' }}>

                {/* Title and Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{item.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">{item.city?.name || item.city || '—'}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">•</Typography>
                      <Typography variant="body2" color="text.secondary">Publicado em {new Date(item.created_at || Date.now()).toLocaleDateString('pt-BR')}</Typography>
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

                {/* Description card */}
                {item.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Descrição</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {item.description}
                    </Typography>
                  </Box>
                )}

                {/* Small info cards */}
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

                {/* Exchange interests */}
                {item.type === 'Trade' && (
                  <Box sx={{ mb: 3, bgcolor: '#ecfdf5', p: 2.5, borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Interesses de troca</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, color: '#085d45' }}>
                      {item.exchange_interests ? item.exchange_interests : 'Nenhum interesse de troca especificado'}
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
                        {item.user?.name?.[0] || item.user?.[0] || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {item.user?.name || item.user || '—'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Membro desde {item.user?.created_at ? new Date(item.user.created_at).toLocaleDateString('pt-BR') : new Date(Date.now()).toLocaleDateString('pt-BR')}
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
          </Grid>
        </Grid>
      </Box>
    </>
  );
}