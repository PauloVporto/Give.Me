import "../styles/Home.css";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Box, Stack, Chip, Typography, CircularProgress, Card, CardMedia, CardContent, CardActionArea, IconButton } from "@mui/material";
import { 
  Inventory as AllIcon,
  Laptop as ElectronicsIcon, 
  Chair as FurnitureIcon,
  MenuBook as BooksIcon,
  SportsSoccer as SportsIcon,
  Home as HomeIcon,
  Smartphone as PhoneIcon,
  Toys as ToysIcon,
  Build as ToolsIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from "@mui/icons-material";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { Navbar, fullUrl, LoadingContainer, EmptyState } from "../components/Base";

// Mapeamento de ícones por categoria
const categoryIcons = {
  "Todas": <AllIcon sx={{ fontSize: 18 }} />,
  "Eletrônicos": <ElectronicsIcon sx={{ fontSize: 18 }} />,
  "Eletronicos": <ElectronicsIcon sx={{ fontSize: 18 }} />,
  "Celulares": <PhoneIcon sx={{ fontSize: 18 }} />,
  "Móveis": <FurnitureIcon sx={{ fontSize: 18 }} />,
  "Moveis": <FurnitureIcon sx={{ fontSize: 18 }} />,
  "Livros": <BooksIcon sx={{ fontSize: 18 }} />,
  "Esportes": <SportsIcon sx={{ fontSize: 18 }} />,
  "Casa": <HomeIcon sx={{ fontSize: 18 }} />,
  "Casa e Decoração": <HomeIcon sx={{ fontSize: 18 }} />,
  "Brinquedos": <ToysIcon sx={{ fontSize: 18 }} />,
  "Ferramentas": <ToolsIcon sx={{ fontSize: 18 }} />
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedType, setSelectedType] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearch] = useState("");
  const [favoritedItems, setFavoritedItems] = useState(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Carregar dados iniciais
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        
        // Fazer requisições em paralelo
        const requests = [
          api.get("/items/"),
          api.get("/categories/")
        ];
        
        if (token) {
          requests.push(api.get("/favorites/"));
        }

        const responses = await Promise.all(requests.map(p => p.catch(e => ({ error: e }))));
        
        if (!mounted) return;

        // Items
        const itemsData = responses[0];
        if (!itemsData.error) {
          const list = Array.isArray(itemsData.data) ? itemsData.data : (itemsData.data?.results || []);
          setAllItems(list);
          setItems(list);
        }

        // Categories
        const categoriesData = responses[1];
        if (!categoriesData.error) {
          const categoryList = Array.isArray(categoriesData.data) ? categoriesData.data : (categoriesData.data?.results || []);
          setCategories(categoryList);
        }

        // Favorites
        if (token && responses[2] && !responses[2].error) {
          const favoriteIds = new Set(responses[2].data.map(fav => fav.item.id));
          setFavoritedItems(favoriteIds);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, []);

  const filteredItems = useMemo(() => {
    let filtered = allItems;

    if (selectedType !== "Todos") {
      filtered = filtered.filter(item => {
        const itemType = (item.type || "").trim();
        return selectedType === "Trocas" ? itemType === "Trade" : itemType === "Donation";
      });
    }

    if (selectedCategory !== "Todas") {
      filtered = filtered.filter(item => {
        const categoryName = item.category_name || item.category?.name || item.category;
        return categoryName === selectedCategory;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.title || "").toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allItems, selectedCategory, selectedType, searchQuery]);

  useEffect(() => {
    setItems(filteredItems);
  }, [filteredItems]);

  const handleCategoryFilter = useCallback((categoryName) => {
    setSelectedCategory(categoryName);
  }, []);

  const handleTypeFilter = useCallback((typeName) => {
    setSelectedType(typeName);
  }, []);

  const handleSearch = useCallback((value) => {
    setSearch(value);
  }, []);

  const toggleFavorite = useCallback(async (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      alert("Você precisa fazer login para favoritar itens");
      return;
    }

    const isFavorited = favoritedItems.has(itemId);

    setFavoritedItems(prev => {
      const newSet = new Set(prev);
      isFavorited ? newSet.delete(itemId) : newSet.add(itemId);
      return newSet;
    });

    try {
      if (isFavorited) {
        await api.delete(`/favorites/remove/${itemId}/`);
      } else {
        await api.post("/favorites/add/", { item_id: itemId });
      }
    } catch (error) {
      setFavoritedItems(prev => {
        const newSet = new Set(prev);
        isFavorited ? newSet.add(itemId) : newSet.delete(itemId);
        return newSet;
      });
      
      if (error.response?.status === 401) {
        alert("Você precisa fazer login para favoritar itens");
      } else {
        alert("Erro ao favoritar item");
      }
      console.error("Erro ao favoritar:", error);
    }
  }, [favoritedItems]);

  return (
    <div className="home">
      <Navbar onSearch={handleSearch} />
      <section className="highlight">
        <img
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1368&h=180&fit=crop&q=80"
          alt="Doação e troca de produtos"
          loading="eager"
          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          }}
        />
        <div className="highlight-info">
          <h2>TOP Donations</h2>
          <button onClick={() => handleTypeFilter("Doações")}>I WANT IT</button>
        </div>
      </section>

      <Box component="section" sx={{ 
        bgcolor: 'background.paper', 
        py: 2, 
        px: 3, 
        boxShadow: 1,
        borderRadius: 3,
        mb: 3
      }}>
        {/* Filtros de tipo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mr: 2, minWidth: 'auto' }}>
            Tipo:
          </Typography>
          <Stack direction="row" spacing={1}>
            {["Todos", "Trocas", "Doações"].map((tipo) => (
              <Chip
                key={tipo}
                label={tipo}
                clickable
                onClick={() => handleTypeFilter(tipo)}
                variant={selectedType === tipo ? "filled" : "outlined"}
                color={selectedType === tipo ? "success" : "default"}
                sx={{
                  fontWeight: selectedType === tipo ? 600 : 400,
                  borderRadius: 2,
                  bgcolor: selectedType === tipo ? '#009959ff' : 'transparent',
                  color: selectedType === tipo ? '#fff' : 'inherit',
                  '&:hover': {
                    bgcolor: selectedType === tipo ? '#007a55' : 'rgba(0,0,0,0.04)'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Filtros de categorias */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mr: 2, minWidth: 'auto' }}>
            Categorias:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Todas chip */}
            <Chip
              icon={categoryIcons["Todas"]}
              label="Todas"
              clickable
              onClick={() => handleCategoryFilter("Todas")}
              variant={selectedCategory === "Todas" ? "filled" : "outlined"}
              sx={{
                fontWeight: selectedCategory === "Todas" ? 600 : 400,
                borderRadius: 2,
                bgcolor: selectedCategory === "Todas" ? '#009959ff' : 'transparent',
                color: selectedCategory === "Todas" ? '#fff' : 'inherit',
                '& .MuiChip-icon': {
                  color: selectedCategory === "Todas" ? '#fff' : 'inherit'
                },
                '&:hover': {
                  bgcolor: selectedCategory === "Todas" ? '#007a55' : 'rgba(0,0,0,0.04)'
                }
              }}
            />

            {categories && categories.length > 0 && categories
              .filter(category => {
                const name = typeof category === 'string' ? category : (category.name || category.title || '');
                return name !== 'Outros' && name !== 'Roupas' && name !== 'Roupas e Acessórios';
              })
              .map((category) => {
                const name = typeof category === 'string' ? category : (category.name || category.title || String(category.id));
                const key = typeof category === 'object' ? (category.id ?? name) : name;
                const icon = categoryIcons[name] || categoryIcons["Outros"];
                
                return (
                  <Chip
                    key={key}
                    icon={icon}
                    label={name}
                    clickable
                    onClick={() => handleCategoryFilter(name)}
                    variant={selectedCategory === name ? "filled" : "outlined"}
                    sx={{
                      fontWeight: selectedCategory === name ? 600 : 400,
                      borderRadius: 2,
                      bgcolor: selectedCategory === name ? '#009959ff' : 'transparent',
                      color: selectedCategory === name ? '#fff' : 'inherit',
                      '& .MuiChip-icon': {
                        color: selectedCategory === name ? '#fff' : 'inherit'
                      },
                      '&:hover': {
                        bgcolor: selectedCategory === name ? '#007a55' : 'rgba(0,0,0,0.04)'
                      }
                    }}
                  />
                );
              })}
          </Box>
        </Box>
      </Box>

      <section className="products">
        {loading && <LoadingContainer />}
        {!loading && items.length === 0 && <EmptyState message="Sem anúncios ainda." />}

        {!loading &&
          items.map((it) => {
            const cover = fullUrl(it.images?.[0]) || "/ImagEtc/SemFoto.png";
            const slugOrId = it.slug || it.id;

            return (
              <Box key={it.id} className="product-item">
                <Card sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 1px 6px rgba(0,0,0,0.08)', 
                  position: 'relative',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)'
                  }
                }}>
                  {/* Botão de favorito */}
                  <IconButton
                    onClick={(e) => toggleFavorite(e, it.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      zIndex: 1,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)',
                      }
                    }}
                  >
                    {favoritedItems.has(it.id) ? (
                      <FavoriteIcon sx={{ color: '#e74c3c', fontSize: 20 }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
                    )}
                  </IconButton>

                  <CardActionArea component={Link} to={`/product/${slugOrId}`}>
                    <CardMedia
                      component="img"
                      image={cover}
                      alt={it.title || 'Item'}
                      sx={{ height: 200, objectFit: 'cover' }}
                      onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: '1rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3em',
                          mb: 1
                        }}
                      >
                        {it.title || 'Sem título'}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                        {it.type === 'Trade' && (
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
                        {it.type === 'Donation' && (
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
                        {it.type === 'Sell' && (
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

                      {it.city && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                          📍 {typeof it.city === 'string' ? it.city : `${it.city.name || ''}, ${it.city.state || ''}`}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Box>
            );
          })}
      </section>
    </div>
  );
}
