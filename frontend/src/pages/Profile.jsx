import React, { useEffect, useState, useMemo } from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import "../styles/Profile.css";
import { Navbar, LoadingContainer } from "../components/Base";
import SettingsPanel from "../components/Seetings";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemsCount, setItemsCount] = useState(0);

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
    
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        const { data: userData } = await api.get("/users/profile/update/");
        if (mounted) setProfile(userData);

        const { data: itemsData } = await api.get("/items/my-items/");
        let itemsTotal = 0;
        if (Array.isArray(itemsData)) {
          itemsTotal = itemsData.length;
        } else if (itemsData?.count !== undefined) {
          itemsTotal = itemsData.count;
        } else if (itemsData?.results) {
          itemsTotal = itemsData.results.length;
        }
        console.log("Total de itens do usuário:", itemsTotal);
        if (mounted) setItemsCount(itemsTotal);
        
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
        if (mounted) setItemsCount(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfileData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingContainer />;
  }

  const joinDate = profile?.date_joined 
    ? new Date(profile.date_joined).toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Março de 2024';

  const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Usuário';

  return (
    <div className="profile-page">
      <Navbar activePage="profile" />
      
      <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
        <Avatar 
          src={profile?.profile?.photo_url}
          sx={{ 
            width: 100, 
            height: 100, 
            margin: '0 auto',
            bgcolor: '#009970',
            fontSize: '2.5rem',
            fontWeight: 600
          }}
        >
          {profile?.first_name?.[0]?.toUpperCase() || '?'}
        </Avatar>
        
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 600, color: '#1a1a1a' }}>
          {fullName}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Entrou em {joinDate}
        </Typography>
        
        {profile?.profile?.bio && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 1.5, 
              px: 3, 
              color: '#637381',
              maxWidth: 500,
              margin: '12px auto 0'
            }}
          >
            {profile.profile.bio}
          </Typography>
        )}
        
        {profile?.profile?.city && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            📍 {profile.profile.city.name}, {profile.profile.city.state}
          </Typography>
        )}

        <Typography 
          variant="body2" 
          sx={{ 
            mt: 1.5, 
            color: '#637381',
            fontWeight: 500
          }}
        >
          {itemsCount} {itemsCount === 1 ? 'Item Cadastrado' : 'Itens Cadastrados'}
        </Typography>
      </Box>

      <section className="profile-settings-section">
        <SettingsPanel />
      </section>
    </div>
  );
}
