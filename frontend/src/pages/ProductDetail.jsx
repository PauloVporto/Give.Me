import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import { FiStar, FiShield, FiPackage, FiMapPin, FiTag, FiMessageCircle } from "react-icons/fi";
import "../styles/Detail.css";
import { BackHeader, BottomNav, fullUrl, LoadingContainer } from "./Base";

export default function ProductDetail() {
  const { slug } = useParams(); // pode ser slug ou id
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Erro ao buscar item:", e);
        console.error("Detalhes:", e.response?.data);
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
      <main className="detail-page">
        <div className="detail-card">
          <LoadingContainer />
        </div>
      </main>
    );
  }
  if (!item) {
    return (
      <main className="detail-page">
        <div className="detail-card">
          <h2>Item não encontrado</h2>
          <button className="btn" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Voltar
          </button>
        </div>
      </main>
    );
  }

  const typeLabel =
    item.type === "Sell" ? "Disponível para Venda" :
    item.type === "Donation" ? "Disponível para Doação" : "Disponível para Troca";

  const cover = item.images?.[0] || item.photos?.[0];
  const imageUrl = fullUrl(cover);

  return (
    <main className="detail-page">
      <article className="detail-card">
        <BackHeader 
          rightElement={isOwner && <Link to={`/edit-item/${item.id}`} className="link-edit">Editar</Link>}
        />

        <div className="detail-hero">
          <img 
            src={imageUrl || "/placeholder.png"} 
            alt={item.title} 
            onError={(e) => {
              console.log('Erro ao carregar imagem:', e);
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>

        <div className="detail-type">{typeLabel}</div>
        <h1 className="detail-title">{item.title}</h1>
        {item.description && <p className="detail-desc">{item.description}</p>}

        <div className="detail-badges">
          <div className="badge-item">
            <FiTag /> Categoria: {item.category_name || "—"}
          </div>
          <div className="badge-item">
            <FiMapPin /> Localização: {item.city?.name || "—"}
          </div>
          <div className="badge-item">
            <FiPackage /> Condição: {item.status === 'new' ? 'Novo' : 'Usado'}
          </div>
          {item.type === "Sell" && (
            <div className="badge"><FiTag /><span>{item.price ? `R$ ${item.price}` : "Preço a combinar"}</span></div>
          )}
        </div>

        <ul className="detail-specs">
          <li className="spec-row">
            <div className="spec-left"><FiPackage /><span>Item Condition</span></div>
            <div className="spec-right">
              {item.condition || "—"}
              {item.rating && <span className="spec-rating"><FiStar /> {Number(item.rating).toFixed(1)}</span>}
            </div>
          </li>
          <li className="spec-row">
            <div className="spec-left"><FiShield /><span>Donor Reputation</span></div>
            <div className="spec-right">{item.reputation || "94% (117 reviews)"}</div>
          </li>
        </ul>

        <footer className="detail-actions">
          <button className="btn btn-primary">
            {item.type === "Sell" ? "Buy" : item.type === "Donation" ? "Request" : "Propose Trade"}
          </button>
          <button className="btn btn-ghost"><FiMessageCircle /> Chat</button>
        </footer>
      </article>

      <BottomNav />
    </main>
  );
}
