import "../styles/Home.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Chip, Typography, Card, CardMedia, CardContent, CardActionArea } from "@mui/material";
import { 
  Inventory as AllIcon,
  Laptop as ElectronicsIcon, 
  Chair as FurnitureIcon,
  MenuBook as BooksIcon,
  SportsSoccer as SportsIcon,
  Home as HomeIcon,
  Smartphone as PhoneIcon,
  Toys as ToysIcon,
  Build as ToolsIcon
} from "@mui/icons-material";
import api from "../api";
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
  const [searchQuery, setSearch] = useState("");


  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Buscar itens
        const { data } = await api.get("/items/");
        const list = Array.isArray(data) ? data : (data?.results || []);
        if (mounted) {
          setAllItems(list);
          setItems(list);
        }

        // Buscar categorias
        try {
          const { data: categoriesData } = await api.get("/categories/");
          const categoryList = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results || []);
          if (mounted) {
            setCategories(categoryList);
          }
        } catch (catError) {
          console.error("categories fetch", catError);
        }
      } catch (e) {
        console.error("home fetch", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const filterItemsByCategory = (categoryName, typeName, query) => {
    let filtered = allItems;

    // Filtrar por tipo (Todos, Trocas, Doações)
    if (typeName !== "Todos") {
      filtered = filtered.filter(item => {
        const itemType = (item.type || "").toString();
        console.log('Item:', item.title, 'Type:', itemType, 'Buscando:', typeName);
        if (typeName === "Trocas") return itemType === "Trade";
        if (typeName === "Doações") return itemType === "Donation";
        return false;
      });
    }

    // Filtrar por categoria
    if (categoryName !== "Todas") {
      filtered = filtered.filter(item => {
        if (item.category_name) {
          return item.category_name === categoryName;
        }
        if (typeof item.category === 'object' && item.category?.name) {
          return item.category.name === categoryName;
        }
        return item.category === categoryName;
      });
    }

    // Filtrar por busca
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim();
      filtered = filtered.filter(item => {
        const title = (item.title || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        const status = (item.status || "").toLowerCase();
        return title.includes(lowerQuery) || 
               description.includes(lowerQuery) || 
               status.includes(lowerQuery);
      });
    }

    return filtered;
  };

  const handleCategoryFilter = (categoryName) => {
    setSelectedCategory(categoryName);
    const filtered = filterItemsByCategory(categoryName, selectedType, searchQuery);
    setItems(filtered);
  };

  const handleTypeFilter = (typeName) => {
    setSelectedType(typeName);
    const filtered = filterItemsByCategory(selectedCategory, typeName, searchQuery);
    setItems(filtered);
  };

const handleSearch = (value) => {
  setSearch(value);

  if (!value.trim()) {
    setItems(allItems); // volta ao padrão
    return;
  }

  const filtered = allItems.filter((item) =>
    item.title?.toLowerCase().includes(value.toLowerCase())
  );

  setItems(filtered);
};

  return (
    <div className="home">
      <Navbar/>
      <section className="highlight">
        <img
          src="data:image/jpeg;base64,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"
          alt="Top donation"
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
                  bgcolor: selectedType === tipo ? '#009970' : 'transparent',
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
                bgcolor: selectedCategory === "Todas" ? '#009970' : 'transparent',
                color: selectedCategory === "Todas" ? '#fff' : 'inherit',
                '& .MuiChip-icon': {
                  color: selectedCategory === "Todas" ? '#fff' : 'inherit'
                },
                '&:hover': {
                  bgcolor: selectedCategory === "Todas" ? '#007a55' : 'rgba(0,0,0,0.04)'
                }
              }}
            />

            {/* Category chips from API - sem Outros e Roupas */}
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
                      bgcolor: selectedCategory === name ? '#009970' : 'transparent',
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
            // determine if item is new (support both portuguese/english labels)
            const statusText = (it.status || "").toString();
            const statusLower = statusText.toLowerCase();
            const isNew = statusLower === 'novo' || statusLower === 'new';
            const conditionLabel = statusText || "Condição não especificada";

            return (
              <Box key={it.id} className="product-item">
                <Card sx={{ borderRadius: 2, boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
                  <CardActionArea component={Link} to={`/product/${slugOrId}`}>
                    <CardMedia
                      component="img"
                      image={cover}
                      alt={it.title || 'Item'}
                      sx={{ aspectRatio: '1/1', objectFit: 'cover' }}
                      onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                    />
                    <CardContent sx={{ pt: 1, pb: 2 }}>
                      <Typography variant="subtitle1" noWrap>
                        {it.title || 'Sem título'}
                      </Typography>

                      <Chip
                        label={conditionLabel}
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: isNew ? '#e6f6eb' : '#fff7e6',
                          color: isNew ? '#1f7a2e' : '#8a6b00',
                          fontWeight: 600,
                        }}
                      />
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
