import React, { memo, useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Card, CardMedia, CardContent, CardActionArea, IconButton, Typography, Stack, Chip } from "@mui/material";
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from "@mui/icons-material";
import { fullUrl } from "./Base";

const ItemCard = memo(({ item, isFavorited, onToggleFavorite }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState("/ImagEtc/SemFoto.png");
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.01
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && item.images?.[0]) {
      const cover = fullUrl(item.images[0]);
      setImageSrc(cover);
    }
  }, [isVisible, item.images]);

  const slugOrId = item.slug || item.id;

  return (
    <Box ref={cardRef} className="product-item">
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
          onClick={(e) => onToggleFavorite(e, item.id)}
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
          {isFavorited ? (
            <FavoriteIcon sx={{ color: '#e74c3c', fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: '#666', fontSize: 20 }} />
          )}
        </IconButton>

        <CardActionArea component={Link} to={`/product/${slugOrId}`}>
          <CardMedia
            component="img"
            image={imageSrc}
            alt={item.title || 'Item'}
            sx={{ height: 200, objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => (e.currentTarget.src = '/ImagEtc/SemFoto.png')}
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
              {item.title || 'Sem título'}
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
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                📍 {typeof item.city === 'string' ? item.city : `${item.city.name || ''}, ${item.city.state || ''}`}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;
