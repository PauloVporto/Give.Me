import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { BackHeader, LoadingContainer, inputStyle, labelStyle, buttonStyle, primaryButtonStyle } from "../components/Base";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", category: "", type: "Sell",
    price: "", condition: "New", location: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/items/${id}/`);
        if (!mounted) return;
        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          type: data.type || "Sell",
          price: data.price ?? "",
          condition: data.condition || "New",
          location: data.location || "",
        });
      } catch (e) {
        console.error("edit fetch", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setType = (type) => setForm({ ...form, type });
  const setCondition = (condition) => setForm({ ...form, condition });

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/items/update/${id}/`, {
        title: form.title,
        description: form.description,
        category: form.category,
        type: form.type,
        price: form.type === "Sell" ? Number(form.price) : null,
        condition: form.condition,
        location: form.location,
      });
      alert("Alterações salvas!");
      navigate(`/product/${id}`); // se você usa slug, troque para navigate(`/product/${data.slug}`)
    } catch (e) {
      console.error("save item", e);
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingContainer />;
  }

  return (
    <main style={{ display:"flex", justifyContent:"center", padding:24 }}>
      <form onSubmit={onSubmit} style={{
        width:"100%", maxWidth:960, background:"#fff", borderRadius:16, padding:24, boxShadow:"0 8px 24px rgba(0,0,0,.06)"
      }}>
        <BackHeader title={`Editar: ${form.title}`} />

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div style={{ gridColumn:"1 / -1" }}>
            <input name="title" placeholder="Título" value={form.title} onChange={handleChange} style={input}/>
          </div>
          <div style={{ gridColumn:"1 / -1" }}>
            <textarea name="description" rows={4} placeholder="Descrição" value={form.description} onChange={handleChange} style={{ ...input, resize:"vertical" }}/>
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
            <input name="category" placeholder="Ex: Clothes" value={form.category} onChange={handleChange} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Localização</label>
            <input name="location" placeholder="Cidade, Estado" value={form.location} onChange={handleChange} style={inputStyle}/>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Tipo</label>
          <div style={{ display:"flex", gap:8 }}>
            {["Sell","Donation","Trade"].map(t => (
              <button type="button" key={t}
                onClick={() => setType(t)}
                style={{ ...chip, background: form.type===t ? "#28a745" : "#fff", color: form.type===t ? "#fff" : "#333" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {form.type === "Sell" && (
          <div style={{ marginTop: 12, maxWidth: 280 }}>
            <label style={labelStyle}>Preço</label>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ ...inputStyle, width:56, textAlign:"center" }}>R$</span>
              <input name="price" placeholder="0,00" value={form.price} onChange={handleChange} style={{ ...inputStyle, flex:1 }}/>
            </div>
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <label style={labelStyle}>Condição</label>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["New","Used - Good Condition","Needs Repair"].map(c => (
              <button type="button" key={c}
                onClick={() => setCondition(c)}
                style={{ ...chip, background: form.condition===c ? "#eaf7ef" : "#fff", border: form.condition===c ? "1px solid transparent" : "1px solid #ddd", color: form.condition===c ? "#28a745" : "#333" }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <footer style={{ marginTop: 20 }}>
          <button type="submit" disabled={saving}
            style={{ ...primaryButtonStyle, opacity: saving ? .7 : 1 }}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </footer>
      </form>
    </main>
  );
}

// Removendo estilos duplicados - agora vêm de Base.jsx
const chip = { padding:"8px 12px", borderRadius:999, border:"1px solid #ddd", cursor:"pointer" };
