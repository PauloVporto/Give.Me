import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { BackHeader, inputStyle, labelStyle, primaryButtonStyle } from "../components/Base";

export default function ListItem() {
  const navigate = useNavigate();

  // Estados para os campos do formulário
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  
  // NOTA: Estes campos são coletados no frontend mas não enviados ao backend atual
  // O modelo Item do backend não tem campos para: type, location, price, photos
  // Eles precisariam ser adicionados ao modelo ou tratados em modelos relacionados
  const [type, setType] = useState("sell");           // "sell" | "donation" | "trade" (não usado no backend)
  const [condition, setCondition] = useState("new");  // "new" | "used-good" | "needs-repair" (mapeado para status)
  const [location, setLocation] = useState("");       // (não usado no backend - usar city)
  const [price, setPrice] = useState("");             // (não usado no backend - modelo não tem campo price)
  const [files, setFiles] = useState([]);             // (não usado no backend - modelo ItemPhoto existe mas não está implementado)
  const [tradeInterest, setTradeInterest] = useState(""); // Campo para interesse de troca
  
  const [submitting, setSubmitting] = useState(false);
  const dropRef = useRef(null);

  // Carregar categorias ao montar (usa o cliente axios `api`)
  useEffect(() => {
    let mounted = true;
    api
      .get("categories/")
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        console.log("Categorias carregadas:", data);
        setCategories(Array.isArray(data) ? data : data?.results || []);
      })
      .catch((err) => {
        console.error("Erro ao carregar categorias:", err);
      });
    return () => (mounted = false);
  }, []);

  function onFilesSelected(list) {
    if (!list) return;
    const arr = Array.from(list).slice(0, 6 - files.length);
    setFiles((prev) => [...prev, ...arr]);
  }
  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
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

  function validate() {
    if (!title.trim()) return "Título é obrigatório.";
    if (type === "sell" && (!price || Number.isNaN(Number(price)))) return "Preço inválido.";
    return null;
  }

  const mapType = (t) => (t === "sell" ? "Sell" : t === "donation" ? "Donation" : "Trade");
  const mapCondition = (c) =>
    c === "new" ? "New" : c === "used-good" ? "Used - Good Condition" : "Needs Repair";

  async function onSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    try {
      setSubmitting(true);
      
      // agora `category` contém o id selecionado do <select>
      const categoryObj = categories.find(c => String(c.id) === String(category));

      if (!categoryObj) {
        alert("Categoria inválida. Escolha uma das opções do select.");
        setSubmitting(false);
        return;
      }

      const mapConditionToStatus = (frontendCondition) => {
        if (frontendCondition === "new") return "new";
        return "used";
      };

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', desc);
      formData.append('category', categoryObj.id);
      formData.append('status', mapConditionToStatus(condition));
      formData.append('type', mapType(type));
      formData.append('listing_state', 'active');
      
      // Adicionar interesse de troca se o tipo for "trade"
      if (type === "trade" && tradeInterest.trim()) {
        formData.append('trade_interest', tradeInterest.trim());
      }
      
      if (location) {
        const parts = location.split(",");

        if (parts.length === 2) {
          const cityName = parts[0].trim();
          const cityState = parts[1].trim();

          formData.append("city_name", cityName);
          formData.append("city_state", cityState);
        }
      }
      
      files.forEach((file) => {
        formData.append('photos', file);
      });

      const { data } = await api.post("items/create/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Item publicado com sucesso!");
      console.log("Item criado:", data);
      
      const itemId = data.id;
      navigate(`/product/${itemId}`);
    } catch (e) {
      console.error("Erro ao criar item:", e);
      const status = e?.response?.status;
      const errorData = e?.response?.data;
      
      let errorMsg = "Erro ao publicar item.\n";
      if (status) errorMsg += `Status: ${status}\n`;
      if (errorData) {
        errorMsg += `Detalhes: ${JSON.stringify(errorData, null, 2)}`;
      } else {
        errorMsg += e.message;
      }
      
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
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
        aria-labelledby="li-title"
      >
        <BackHeader title="Cadastrar novo produto" />

        {/* Photos */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, margin: "0 0 8px", color: "var(--text-dark)" }}>Fotos do Item</h2>
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
                Arraste imagens aqui ou <u>clique para enviar</u> (até 6)
              </span>
            </label>
          </div>

          {files.length > 0 && (
            <ul
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12,
                marginTop: 12,
                listStyle: "none",
                padding: 0,
              }}
            >
              {files.map((f, i) => {
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
                      onClick={() => removeFile(i)}
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
          )}
        </section>

        {/* Item Information */}
        <section>
          <h2 style={{ fontSize: 14, margin: "0 0 12px", color: "var(--text-dark)" }}>Informações do Item</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <input
                placeholder="Título do Item (Ex: Celular Usado, Roupas Infantis)"
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
                if (value !== "trade") {
                  setTradeInterest(""); // Limpa o campo se não for troca
                }
              }}
              options={[
                { value: "sell", label: "Venda" },
                { value: "trade", label: "Troca" },
                { value: "donation", label: "Doação" },
              ]}
            />
          </div>

          {/* Campo de interesse de troca - aparece apenas quando type === "trade" */}
          {type === "trade" && (
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

          {type === "sell" && (
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
                { value: "new", label: "Novo" },
                { value: "used-good", label: "Usado - Bom Estado" },
                { value: "needs-repair", label: "Precisa de Reparo" },
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
            {submitting ? "Publicando..." : "Publicar Item"}
          </button>
        </footer>
      </form>
    </main>
  );
}

// Removendo as constantes duplicadas - agora vêm de Base.jsx

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
