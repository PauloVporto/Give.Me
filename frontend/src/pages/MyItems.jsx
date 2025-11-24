import "../styles/MyItems.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Chip, Typography, Card, CardMedia, CardContent, CardActionArea, IconButton } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import api from "../api";
import { Navbar, fullUrl, LoadingContainer, EmptyState } from "../components/Base";

export default function MyItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("Todos");

  useEffect(() => {
    fetchMyItems();
  }, []);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      
      // Usar a nova API que já filtra automaticamente
      const { data } = await api.get("/items/my-items/");
      
      console.log("Meus itens da API:", data.length);
      
      setItems(Array.isArray(data) ? data : (data?.results || []));
    } catch (error) {
      console.error("Erro ao buscar meus itens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await api.delete(`/items/delete/${itemId}/`);
        // Atualizar lista removendo o item deletado
        setItems(items.filter(item => item.id !== itemId));
      } catch (error) {
        console.error("Erro ao deletar item:", error);
        alert("Erro ao deletar item. Tente novamente.");
      }
    }
  };

  const filterByType = (type) => {
    setSelectedType(type);
  };

  const filteredItems = selectedType === "Todos" 
    ? items 
    : items.filter(item => {
        if (selectedType === "Doações") return item.type === "Donation";
        if (selectedType === "Trocas") return item.type === "Trade";
        return true;
      });

  if (loading) {
    return <LoadingContainer />;
  }

  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
            Meus Itens
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus anúncios cadastrados
          </Typography>
        </Box>

        {/* Filtros de tipo */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1}>
            <Chip
              label="Todos"
              onClick={() => filterByType("Todos")}
              color={selectedType === "Todos" ? "success" : "default"}
              variant={selectedType === "Todos" ? "filled" : "outlined"}
              sx={{
                bgcolor: selectedType === "Todos" ? '#009970' : 'transparent',
                color: selectedType === "Todos" ? '#fff' : 'inherit',
                '&:hover': {
                  bgcolor: selectedType === "Todos" ? '#007a55' : 'rgba(0,0,0,0.04)'
                }
              }}
            />
            <Chip
              label="Doações"
              onClick={() => filterByType("Doações")}
              color={selectedType === "Doações" ? "success" : "default"}
              variant={selectedType === "Doações" ? "filled" : "outlined"}
              sx={{
                bgcolor: selectedType === "Doações" ? '#009970' : 'transparent',
                color: selectedType === "Doações" ? '#fff' : 'inherit',
                '&:hover': {
                  bgcolor: selectedType === "Doações" ? '#007a55' : 'rgba(0,0,0,0.04)'
                }
              }}
            />
            <Chip
              label="Trocas"
              onClick={() => filterByType("Trocas")}
              color={selectedType === "Trocas" ? "success" : "default"}
              variant={selectedType === "Trocas" ? "filled" : "outlined"}
              sx={{
                bgcolor: selectedType === "Trocas" ? '#009970' : 'transparent',
                color: selectedType === "Trocas" ? '#fff' : 'inherit',
                '&:hover': {
                  bgcolor: selectedType === "Trocas" ? '#007a55' : 'rgba(0,0,0,0.04)'
                }
              }}
            />
          </Stack>
        </Box>

        {filteredItems.length === 0 ? (
          <EmptyState 
            message={selectedType === "Todos" 
              ? "Você ainda não cadastrou nenhum item"
              : `Você não tem itens do tipo "${selectedType}"`
            }
            subtitle="Clique no botão + Adicionar no topo para criar um novo anúncio"
          />
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 3 
          }}>
            {filteredItems.map((item) => {
              const mainImage = item.images?.[0] || item.photos?.[0];
              
              return (
                <Card 
                  key={item.id}
                  sx={{ 
                    position: 'relative',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    '&:hover .item-actions': {
                      opacity: 1
                    }
                  }}
                >
                  {/* Botões de ação */}
                  <Box 
                    className="item-actions"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      gap: 1,
                      zIndex: 1
                    }}
                  >
                    <IconButton
                      component={Link}
                      to={`/edit-item/${item.id}`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                        boxShadow: 1
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        color: '#dc2626',
                        '&:hover': { 
                          bgcolor: 'rgba(255, 255, 255, 1)',
                          color: '#b91c1c'
                        },
                        boxShadow: 1
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <CardActionArea component={Link} to={`/product/${item.slug || item.id}`}>
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

                      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                        {item.type === 'Trade' && (
                          <Chip 
                            label="Troca" 
                            size="small" 
                            sx={{ 
                              bgcolor: '#009970',
                              color: '#fff',
                              fontSize: 12
                            }}
                          />
                        )}
                        {item.type === 'Donation' && (
                          <Chip 
                            label="Doação" 
                            size="small" 
                            sx={{ 
                              bgcolor: '#0288d1',
                              color: '#fff',
                              fontSize: 12
                            }}
                          />
                        )}
                        {item.type === 'Sell' && (
                          <Chip 
                            label="Venda" 
                            size="small" 
                            sx={{ 
                              bgcolor: '#e43011ff',
                              color: '#fff',
                              fontSize: 12
                            }}
                          />
                        )}
                      </Stack>

                      {item.city && (
                        <Typography variant="body2" color="text.secondary">
                          📍 {item.city.name || item.city_name}, {item.city.state || ''}
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
    </>
  );
}
