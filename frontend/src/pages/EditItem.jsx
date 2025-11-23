import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import api from "../api";
import { BackHeader, LoadingContainer, inputStyle, labelStyle, primaryButtonStyle, fullUrl } from "../components/Base";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para os campos do formulário
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState("Sell");
  const [condition, setCondition] = useState("New");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [tradeInterest, setTradeInterest] = useState("");
  
  // Estados para imagens
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [existingPhotoIds, setExistingPhotoIds] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const dropRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Carregar categorias
  useEffect(() => {
    let mounted = true;
    api
      .get("categories/")
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setCategories(Array.isArray(data) ? data : data?.results || []);
      })
      .catch((err) => {
        console.error("Erro ao carregar categorias:", err);
      });
    return () => (mounted = false);
  }, []);

  // Carregar dados do item
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/items/${id}/`);
        if (!mounted) return;
        
        setTitle(data.title || "");
        setDesc(data.description || "");
        setCategory(data.category || "");
        setType(data.type || "Sell");
        setCondition(data.status === "new" ? "New" : data.status === "used" ? "Used - Good Condition" : "New");
        setTradeInterest(data.trade_interest || "");
        
        // Localização
        if (data.city) {
          setLocation(`${data.city.name}, ${data.city.state}`);
        }
        
        setPrice(data.price || "");
        
        // Fotos existentes
        setExistingPhotos(data.photos || data.images || []);
        setExistingPhotoIds(data.photos_id || []);
      } catch (e) {
        console.error("Erro ao carregar item:", e);
        alert("Erro ao carregar dados do item");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const mapConditionToStatus = (frontendCondition) => {
    if (frontendCondition === "New") return "new";
    return "used";
  };

  // Funções para gerenciar fotos
  function onFilesSelected(list) {
    if (!list) return;
    const totalPhotos = existingPhotos.length + newFiles.length;
    const availableSlots = 6 - totalPhotos;
    const arr = Array.from(list).slice(0, availableSlots);
    setNewFiles((prev) => [...prev, ...arr]);
  }

  function removeNewFile(i) {
    setNewFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function removeExistingPhoto(photoId) {
    if (!window.confirm("Tem certeza que deseja remover esta foto?")) return;
    
    try {
      await api.delete(`/items/photos/${photoId}/`);
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
      alert("Foto removida com sucesso!");
    } catch (e) {
      console.error("Erro ao remover foto:", e);
      alert("Erro ao remover foto.");
    }
  }

  function onDrop(e) {
    e.preventDefault();
    dropRef.current?.classList.remove("ring");
    onFilesSelected(e.dataTransfer.files);
  }

  function onDragOver(e) {
    e.preventDefault();
    dropRef.current?.classList.add("ring");
  }

  function onDragLeave() {
    dropRef.current?.classList.remove("ring");
  }

  async function onSubmit(e) {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Título é obrigatório.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: title,
        description: desc,
        category: category,
        status: mapConditionToStatus(condition),
        type: type,
        listing_state: 'active'
      };

      // Adicionar preço se o tipo for "Sell"
      if (type === "Sell" && price) {
        payload.price = price;
      }

      // Adicionar interesse de troca se o tipo for "Trade"
      if (type === "Trade" && tradeInterest.trim()) {
        payload.trade_interest = tradeInterest.trim();
      }

      // Localização
      if (location) {
        const parts = location.split(",");
        if (parts.length === 2) {
          payload.city_name = parts[0].trim();
          payload.city_state = parts[1].trim();
        }
      }

      await api.put(`/items/update/${id}/`, payload);

      // Enviar novas fotos se houver
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => {
          formData.append('photos', file);
        });
        
        try {
          await api.post(`/items/${id}/photos/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        } catch (photoError) {
          console.error("Erro ao enviar fotos:", photoError);
          alert("Item atualizado, mas houve erro ao adicionar algumas fotos.");
        }
      }

      alert("Item atualizado com sucesso!");
      navigate(`/product/${id}`);
    } catch (e) {
      console.error("Erro ao atualizar item:", e);
      alert("Erro ao atualizar item.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingContainer />;
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 960,
          background: "var(--container-bg)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 8px 24px rgba(0,0,0,.06)",
        }}
      >
        <BackHeader title={`Editar: ${title}`} />

        {/* Photos Section */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, margin: "0 0 8px", color: "var(--text-dark)" }}>Fotos do Item</h2>
          
          {/* Fotos existentes */}
          {existingPhotos.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Fotos atuais:</p>
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 12,
                  marginBottom: 12,
                  listStyle: "none",
                  padding: 0,
                }}
              >
              {existingPhotos.map((photo_url, index) => {
                  const photo_id = existingPhotoIds[index];
                  if (!photo_id) return null;
                  return (
                    <li key={photo_id} style={{ position: "relative" }}> 
                      <img
                        src={fullUrl(photo_url)} 
                        alt="Foto do item"
                        style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        objectFit: "cover",
                        borderRadius: 12,
                        border: "1px solid #eee",                       
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(photo_id)}
                        style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        border: 0,
                        background: "#dc2626",
                        color: "#fff",
                        borderRadius: 999,
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: 12,
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Upload de novas fotos */}
          {(existingPhotos.length + newFiles.length) < 6 && (
            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              style={{
                background: "#eaf7ef",
                border: "1px dashed #b6e7c6",
                borderRadius: 16,
                padding: 24,
                textAlign: "center",
              }}
            >
              <input
                id="photos"
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => onFilesSelected(e.target.files)}
              />
              <label htmlFor="photos" style={{ cursor: "pointer", display: "block" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                <span style={{ color: "var(--text-regular)" }}>
                  Adicionar mais fotos (máx. {6 - existingPhotos.length - newFiles.length})
                </span>
              </label>
            </div>
          )}

          {/* Preview de novas fotos */}
          {newFiles.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: "#666", marginTop: 12, marginBottom: 8 }}>Novas fotos a adicionar:</p>
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 12,
                  listStyle: "none",
                  padding: 0,
                }}
              >
                {newFiles.map((f, i) => {
                  const url = URL.createObjectURL(f);
                  return (
                    <li key={i} style={{ position: "relative" }}>
                      <img
                        src={url}
                        alt={f.name}
                        style={{
                          width: "100%",
                          aspectRatio: "1/1",
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid #eee",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          border: 0,
                          background: "#fff",
                          borderRadius: 999,
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Item Information */}
        <section>
          <h2 style={{ fontSize: 14, margin: "0 0 12px", color: "var(--text-dark)" }}>Informações do Item</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <input
                placeholder="Título do Item"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <textarea
                rows={4}
                placeholder="Descrição"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ ...inputStyle, resize: "vertical" }}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ ...inputStyle, height: 40 }}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Localização</label>
              <input
                placeholder="Cidade, Estado"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Listing Type */}
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Tipo de Anúncio</label>
            <Segmented
              value={type}
              onChange={(value) => {
                setType(value);
                if (value !== "Trade") {
                  setTradeInterest("");
                }
              }}
              options={[
                { value: "Sell", label: "Venda" },
                { value: "Trade", label: "Troca" },
                { value: "Donation", label: "Doação" },
              ]}
            />
          </div>

          {/* Campo de interesse de troca */}
          {type === "Trade" && (
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>O que você aceita em troca?</label>
              <textarea
                rows={3}
                placeholder="Ex: Bicicleta aro 26, notebook usado, ou qualquer eletrônico"
                value={tradeInterest}
                onChange={(e) => setTradeInterest(e.target.value)}
                style={{ ...inputStyle, resize: "vertical", marginTop: 8 }}
              />
              <small style={{ color: "#666", fontSize: 12, display: "block", marginTop: 4 }}>
                Descreva o que você tem interesse em receber como troca por este item
              </small>
            </div>
          )}

          {type === "Sell" && (
            <div style={{ marginTop: 12, maxWidth: 280 }}>
              <label style={labelStyle}>Preço</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...inputStyle, width: 56, textAlign: "center" }}>R$</span>
                <input
                  inputMode="decimal"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>
            </div>
          )}

          {/* Condition */}
          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Condição</label>
            <Chips
              value={condition}
              onChange={setCondition}
              options={[
                { value: "New", label: "Novo" },
                { value: "Used - Good Condition", label: "Usado - Bom Estado" },
                { value: "Needs Repair", label: "Precisa de Reparo" },
              ]}
            />
          </div>
        </section>

        <footer style={{ marginTop: 24 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              ...primaryButtonStyle,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Salvando..." : "Salvar Alterações"}
          </button>
        </footer>
      </form>
    </main>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: "inline-flex", background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: 4 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              background: active ? "var(--main-green)" : "transparent",
              color: active ? "#fff" : "var(--text-dark)",
              fontWeight: 500,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Chips({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: active ? "1px solid transparent" : "1px solid #ddd",
              background: active ? "#eaf7ef" : "#fff",
              color: active ? "var(--main-green)" : "var(--text-dark)",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
