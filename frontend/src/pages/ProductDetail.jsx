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
  Card,
  CardMedia,
  CardContent,
  Avatar,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Edit, ChatBubbleOutline, Star, LocationOn, Tag as TagIcon } from "@mui/icons-material";
import { fullUrl, Navbar } from "./Base";

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
        <Card sx={{ p: 2, maxWidth: 400 }}>
          <CardContent>
            <Typography variant="h6">Item não encontrado</Typography>
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const images = (item.images || item.photos || []).map((img) => fullUrl(img));
  const mainImage = images[selectedImage] || images[0] || "/placeholder.png";

  const typeLabel =
    item.type === "Sell" ? "Disponível para Venda" :
    item.type === "Donation" ? "Disponível para Doação" : "Disponível para Troca";

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: "background.default" }}>
        <Grid container spacing={0}>
          <Grid item xs={12} md={12} lg={12}>
          <Box sx={{ bgcolor: "background.paper", px: { xs: 2, sm: 3, md: 15 } }}>
            <Box sx={{ display: "flex", alignItems: "center", py: 2, borderBottom: 1, borderColor: "divider" }}>
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

            <CardMedia
              component="img"
              image={mainImage}
              alt={item.title}
              sx={{ 
                width: "100%", 
                height: { xs: 350, sm: 450, md: 550 }, 
                objectFit: "contain", 
                bgcolor: "grey.100",
                my: 2,
                borderRadius: 2
              }}
            />

            <Box sx={{ pb: 4 }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: "0.75rem" }}>{typeLabel}</Typography>
                <Chip icon={<TagIcon />} label={item.category_name || "—"} size="small" />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 500, flex: 1 }}>{item.title}</Typography>
                <Typography variant="h4" color="primary" fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                  {item.type === "Sell" ? (item.price ? `R$ ${item.price}` : "Preço a combinar") : (item.type === "Donation" ? "Doação" : "Troca")}
                </Typography>
              </Box>
              {item.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2, whiteSpace: "pre-line", lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body1">{item.city?.name || "—"}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Typography variant="body1">Condição: <strong>{item.status === 'new' ? 'Novo' : 'Usado'}</strong></Typography>
                {item.rating && (
                  <>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Star fontSize="small" sx={{ color: 'gold' }} />
                      <Typography variant="body1" fontWeight="medium">{Number(item.rating).toFixed(1)}</Typography>
                    </Box>
                  </>
                )}
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, mt: 3, flexWrap: "wrap", pb: 2 }}>
                {images.slice(0, 8).map((src, idx) => (
                  <SmallImage key={idx} src={src} alt={`${item.title} ${idx}`} onClick={() => setSelectedImage(idx)} selected={idx === selectedImage} />
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={12} lg={3}>
          <Box sx={{ 
            bgcolor: "background.paper", 
            minHeight: { md: "100vh" }, 
            borderLeft: { md: 1 }, 
            borderColor: "divider",
            px: { xs: 2, sm: 3 },
            py: { xs: 3, md: 0 }
          }}>
            <Box sx={{ 
              position: { xs: "relative", md: "sticky" }, 
              top: { md: 80 },
              pt: { md: 3 },
              pb: 3,
              zIndex: 10
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar 
                  src={fullUrl(item.owner_avatar || item.user_avatar || item.avatar)} 
                  alt={item.owner_name || item.username || 'Vendedor'}
                  sx={{ width: 56, height: 56 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{item.owner_name || item.username || 'Vendedor'}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.owner_reputation || item.reputation || '—'}</Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth 
                  startIcon={<ChatBubbleOutline />} 
                  sx={{ 
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none"
                  }}
                >
                  {item.type === 'Sell' ? 'Comprar agora' : item.type === 'Donation' ? 'Solicitar' : 'Propor troca'}
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  fullWidth 
                  startIcon={<ChatBubbleOutline />} 
                  sx={{ 
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none"
                  }}
                >
                  Enviar mensagem
                </Button>
                <Button 
                  component={Link} 
                  to="/" 
                  variant="text" 
                  fullWidth 
                  sx={{ 
                    mt: 1,
                    textTransform: "none",
                    fontSize: "0.9rem"
                  }}
                >
                  Ver mais anúncios do vendedor
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  ID do anúncio: {item.id}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Publicado em: {new Date(item.created_at || Date.now()).toLocaleDateString('pt-BR')}
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
