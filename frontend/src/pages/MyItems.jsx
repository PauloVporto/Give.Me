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
      
      // Decodificar o token JWT para obter o user_id
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("Token não encontrado");
        return;
      }
      
      // Decodificar payload do JWT (formato: header.payload.signature)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = payload.user_id;
      
      console.log("User ID do token:", currentUserId);
      
      // Buscar todos os itens
      const { data } = await api.get("/items/");
      
      // Filtrar apenas itens do usuário logado
      const myItems = data.filter(item => item.user === currentUserId);
      
      console.log("Meus itens filtrados:", myItems.length);
      
      setItems(myItems);
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
      <div className="my-items">
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
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
            />
            <Chip
              label="Doações"
              onClick={() => filterByType("Doações")}
              color={selectedType === "Doações" ? "success" : "default"}
              variant={selectedType === "Doações" ? "filled" : "outlined"}
            />
            <Chip
              label="Trocas"
              onClick={() => filterByType("Trocas")}
              color={selectedType === "Trocas" ? "success" : "default"}
              variant={selectedType === "Trocas" ? "filled" : "outlined"}
            />
          </Stack>
        </Box>

        {filteredItems.length === 0 ? (
          <EmptyState 
            message={selectedType === "Todos" 
              ? "Você ainda não cadastrou nenhum item"
              : `Você não tem itens do tipo "${selectedType}"`
            }
            action={
              <Link to="/create-item" style={{ textDecoration: 'none' }}>
                <Chip 
                  label="Adicionar Item" 
                  color="success" 
                  sx={{ mt: 2, cursor: 'pointer' }}
                />
              </Link>
            }
          />
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="item-card"
                sx={{ 
                  position: 'relative',
                  '&:hover .item-actions': {
                    opacity: 1
                  }
                }}
              >
                <Link to={`/product/${item.slug}`} style={{ textDecoration: 'none' }}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="200"
                      image={fullUrl(item.photos?.[0]?.image)}
                      alt={item.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '16px',
                          fontWeight: 600,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.city_name}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={item.type === "Donation" ? "Doação" : item.type === "Trade" ? "Troca" : "Venda"}
                          size="small"
                          color={item.type === "Donation" ? "success" : item.type === "Trade" ? "primary" : "default"}
                        />
                        <Chip 
                          label={item.category_name}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Link>
                
                <Box 
                  className="item-actions"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <IconButton
                    component={Link}
                    to={`/edit-item/${item.id}`}
                    size="small"
                    sx={{
                      bgcolor: 'white',
                      '&:hover': { bgcolor: '#f5f5f5' },
                      boxShadow: 1
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(item.id);
                    }}
                    size="small"
                    sx={{
                      bgcolor: 'white',
                      color: '#dc2626',
                      '&:hover': { bgcolor: '#fee2e2' },
                      boxShadow: 1
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
