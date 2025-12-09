import { useState } from "react";
import { clientAPI } from "../api/api";

export default function Dashboard() {
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [islem, setIslem] = useState("toplama");
  const [sonuc, setSonuc] = useState(null);
  const [hata, setHata] = useState(null);
  const [loading, setLoading] = useState(false);

  const hesapla = async () => {
    setHata(null);
    setSonuc(null);
    setLoading(true);

    try {
      const payload = {
        sayi1: Number(s1),
        sayi2: s2 === "" ? null : Number(s2),
        islem,
      };

      const r = await clientAPI.post("/client/hesapla", payload);
      // client_api {"cevap": {"sonuc": ...}} dönüyor
      setSonuc(r.data.cevap.sonuc);
    } catch (err) {
      console.error("DASHBOARD HATA:", err);
      setHata("Hesaplama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const wrapperStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1e293b, #0f172a)",
    padding: "20px",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#0b1120",
    borderRadius: "16px",
    padding: "24px 28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    color: "#e5e7eb",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "4px",
  };

  const subtitleStyle = {
    fontSize: "13px",
    color: "#9ca3af",
    marginBottom: "18px",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #4b5563",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none",
    cursor: "pointer",
  };

  const buttonStyle = {
    marginTop: "16px",
    width: "100%",
    padding: "10px 12px",
    borderRadius: "999px",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    background: loading
      ? "linear-gradient(135deg,#6b7280,#4b5563)"
      : "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#020617",
    transition: "transform 0.1s ease, box-shadow 0.1s ease",
    boxShadow: loading ? "none" : "0 12px 20px rgba(34,197,94,0.25)",
  };

  const errorStyle = {
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    backgroundColor: "#450a0a",
    border: "1px solid #f97373",
    fontSize: "14px",
    color: "#fecaca",
  };

  const resultStyle = {
    marginTop: "16px",
    padding: "12px 14px",
    borderRadius: "10px",
    backgroundColor: "#022c22",
    border: "1px solid #16a34a",
    fontSize: "16px",
    fontWeight: "600",
    color: "#bbf7d0",
    textAlign: "center",
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Dashboard</h1>
        <p style={subtitleStyle}>
          Buradan hızlıca işlem yapabilir, sonucu anında görebilirsin.
        </p>

        <div style={{ display: "grid", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Sayı 1</label>
            <input
              style={inputStyle}
              type="number"
              placeholder="Örn: 10"
              value={s1}
              onChange={(e) => setS1(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Sayı 2</label>
            <input
              style={inputStyle}
              type="number"
              placeholder="Örn: 5"
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              disabled={islem === "karekök"}
            />
          </div>

          <div>
            <label style={labelStyle}>İşlem</label>
            <select
              style={selectStyle}
              value={islem}
              onChange={(e) => setIslem(e.target.value)}
            >
              <option value="toplama">Toplama</option>
              <option value="çıkarma">Çıkarma</option>
              <option value="çarpma">Çarpma</option>
              <option value="bölme">Bölme</option>
              <option value="üs">Üs</option>
              <option value="karekök">Karekök</option>
            </select>
          </div>
        </div>

        <button style={buttonStyle} onClick={hesapla} disabled={loading}>
          {loading ? "Hesaplanıyor..." : "Hesapla"}
        </button>

        {hata && <div style={errorStyle}>{hata}</div>}

        {sonuc !== null && (
          <div style={resultStyle}>Sonuç: {sonuc}</div>
        )}
      </div>
    </div>
  );
}
c