import "../styles/Favorites.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Chip, Typography, Card, CardMedia, CardContent, CardActionArea, IconButton } from "@mui/material";
import { Favorite as FavoriteIcon } from "@mui/icons-material";
import api from "../api";
import { Navbar, fullUrl, LoadingContainer, EmptyState } from "../components/Base";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/favorites/");
      setFavorites(data);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await api.delete(`/favorites/remove/${itemId}/`);
      // Remover da lista local
      setFavorites(favorites.filter(fav => fav.item.id !== itemId));
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      if (error.response?.status === 404) {
        // Se não encontrado, apenas remover do estado local
        setFavorites(favorites.filter(fav => fav.item.id !== itemId));
      } else {
        alert("Erro ao remover favorito");
      }
    }
  };

  if (loading) {
    return <LoadingContainer />;
  }

  return (
    <div className="favorites-page">
      <Navbar />
      
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1a1a1a' }}>
          Meus Favoritos
        </Typography>

        {favorites.length === 0 ? (
          <EmptyState 
            message="Você ainda não tem itens favoritos" 
            subtitle="Explore os anúncios e clique no coração para adicionar aos favoritos"
          />
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 3 
          }}>
            {favorites.map((favorite) => {
              const item = favorite.item;
              const mainImage = item.images?.[0] || item.photos?.[0];
              
              return (
                <Card 
                  key={favorite.id}
                  sx={{ 
                    position: 'relative',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {/* Botão de remover favorito */}
                  <IconButton
                    onClick={(e) => handleRemoveFavorite(e, item.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      zIndex: 1,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                      }
                    }}
                  >
                    <FavoriteIcon sx={{ color: '#e74c3c', fontSize: 24 }} />
                  </IconButton>

                  <CardActionArea component={Link} to={`/product/${item.id}`}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={mainImage ? fullUrl(mainImage) : "/placeholder.png"}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.title}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip 
                          label={item.category_name || item.category}
                          size="small"
                          sx={{ 
                            bgcolor: '#f0f0f0',
                            fontSize: 12
                          }}
                        />
                        {item.type === 'Trade' && (
                          <Chip 
                            label="Troca" 
                            size="small" 
                            color="success"
                            sx={{ fontSize: 12 }}
                          />
                        )}
                        {item.type === 'Donation' && (
                          <Chip 
                            label="Doação" 
                            size="small" 
                            color="info"
                            sx={{ fontSize: 12 }}
                          />
                        )}
                      </Stack>

                      {item.city && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {item.city.name}, {item.city.state}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </div>
  );
}
