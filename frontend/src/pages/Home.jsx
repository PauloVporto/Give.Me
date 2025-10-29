import "../styles/Home.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Box, Stack, Chip, Typography } from "@mui/material";
import api from "../api";
import { MainHeader, SearchBar, BottomNav, TopNav, fullUrl, LoadingContainer, EmptyState } from "./Base";

export default function Home() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filterItems = (categoryName, query) => {
    let filtered = allItems;

    // Filtrar por categoria
    if (categoryName !== "All") {
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
    const filtered = filterItems(categoryName, searchQuery);
    setItems(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = filterItems(selectedCategory, query);
    setItems(filtered);
  };

  return (
    <div className="home">
      <MainHeader />
      <SearchBar />

      <section className="highlight">
        <img
          src="data:image/jpeg;base64,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"
          alt="Top donation"
        />
        <div className="highlight-info">
          <h2>TOP Donations</h2>
          <Link to="/create-item">
            <button>I WANT IT</button>
          </Link>
        </div>
      </section>

      <Box component="section" className="categories" sx={{ my: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Categories</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
          {/* All chip */}
          <Chip
            label="All"
            clickable
            onClick={() => handleCategoryFilter("All")}
            variant={selectedCategory === "All" ? "filled" : "outlined"}
            color={selectedCategory === "All" ? "success" : "default"}
            size="medium"
            sx={{ fontWeight: selectedCategory === "All" ? 600 : 500 }}
            aria-pressed={selectedCategory === "All"}
          />

          {/* Category chips from API */}
          {categories && categories.length > 0 ? (
            categories.map((cat) => {
              const name = typeof cat === 'string' ? cat : (cat.name || cat.title || String(cat.id));
              const key = typeof cat === 'object' ? (cat.id ?? name) : name;
              return (
                <Chip
                  key={key}
                  label={name}
                  clickable
                  onClick={() => handleCategoryFilter(name)}
                  variant={selectedCategory === name ? "filled" : "outlined"}
                  color={selectedCategory === name ? "success" : "default"}
                  size="medium"
                  sx={{ fontWeight: selectedCategory === name ? 600 : 500 }}
                  aria-pressed={selectedCategory === name}
                />
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary">No categories</Typography>
          )}
        </Stack>
      </Box>

      <section className="products">
        {loading && <LoadingContainer />}
        {!loading && items.length === 0 && <EmptyState message="Sem anúncios ainda." />}

        {!loading &&
          items.map((it) => {
            const cover = fullUrl(it.images?.[0]);
            const slugOrId = it.slug || it.id;
            return (
              <Link key={it.id} className="product-card" to={`/product/${slugOrId}`}>
                <img
                  src={cover || "/placeholder.png"}
                  alt={it.title || "Item"}
                  onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                />
                <div className="product-info">
                  <h3 className="product-title">{it.title || "Sem título"}</h3>
                  <p className="product-condition">{it.status || "Condição não especificada"}</p>
                </div>
              </Link>
            );
          })}
      </section>

      <BottomNav activePage="home" />
    </div>
  );
}
