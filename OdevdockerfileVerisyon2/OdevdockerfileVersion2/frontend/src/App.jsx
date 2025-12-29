import { useState, useEffect, useMemo } from "react";
import { clientAPI } from "./api/api";
import Login from "./pages/Login";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [sayi1, setSayi1] = useState("");
  const [sayi2, setSayi2] = useState("");
  const [islem, setIslem] = useState("toplama");

  const [sonuc, setSonuc] = useState(null);
  const [gecmis, setGecmis] = useState([]);

  const [hata, setHata] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filterIslem, setFilterIslem] = useState("hepsi");

  const fetchGecmis = async () => {
    try {
      const r = await clientAPI.get("/client/gecmis");
      const liste = r?.data?.gecmis ?? r?.data ?? [];
      setGecmis(Array.isArray(liste) ? liste : []);
    } catch (e) {
      // geçmiş gelmezse uygulamayı çökertme
      setGecmis([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const ok = !!token;
    setIsAuthenticated(ok);

    if (ok) {
      fetchGecmis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hesapla = async () => {
    try {
      setHata(null);

      // Basit validasyon
      if (sayi1 === "" || Number.isNaN(Number(sayi1))) {
        setHata("Sayı 1 zorunlu.");
        return;
      }
      if (islem !== "karekök" && (sayi2 === "" || Number.isNaN(Number(sayi2)))) {
        setHata("Sayı 2 zorunlu.");
        return;
      }

      setLoading(true);

      const payload = {
        islem,
        sayi1: Number(sayi1),
        sayi2: islem === "karekök" ? null : (sayi2 === "" ? null : Number(sayi2)),
      };

      // Not: clientAPI ile de post atabilirdin. Burada raw fetch kullandım çünkü
      // response formatını daha rahat yakalıyoruz.
      const res = await fetch("http://localhost:8000/client/hesapla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data?.message ||
          data?.error ||
          `HTTP ${res.status} - ${text || "Bilinmeyen hata"}`;
        throw new Error(msg);
      }

      // farklı response şekillerine tolerans
      const sonucDegeri = data?.sonuc ?? data?.result ?? data?.data?.sonuc;

      if (sonucDegeri === undefined || sonucDegeri === null) {
        throw new Error(`Beklenmeyen cevap formatı: ${text}`);
      }

      setSonuc(sonucDegeri);

      // işlem sonrası geçmişi yenile
      await fetchGecmis();
    } catch (e) {
      console.error("DETAYLI HATA:", e);
      setHata(e?.message || "Hesaplama sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const gecmisiTemizle = async () => {
    setHata(null);
    try {
      setLoading(true);
      await clientAPI.post("/client/gecmis/temizle");
      setGecmis([]);
      setSonuc(null);
    } catch (error) {
      console.error("GEÇMİŞ TEMİZLE HATA:", error);
      setHata("Geçmiş temizlenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setGecmis([]);
    setSonuc(null);
    setSayi1("");
    setSayi2("");
    setHata(null);
  };

  const filtrelenmisGecmis = useMemo(() => {
    if (filterIslem === "hepsi") return gecmis;
    return gecmis.filter((item) => item.islem === filterIslem);
  }, [gecmis, filterIslem]);

  // ============ AUTH YOKSA SADECE LOGIN ============
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => { setIsAuthenticated(true); fetchGecmis(); }} />;
  }

  // ============ AUTH VARSA HESAP MAKİNESİ ============
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
    maxWidth: "900px",
    backgroundColor: "#0b1120",
    borderRadius: "16px",
    padding: "24px 28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    color: "#e5e7eb",
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const titleRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "8px",
  };

  const logoutButtonStyle = {
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid #4b5563",
    background: "transparent",
    color: "#e5e7eb",
    fontSize: "13px",
    cursor: "pointer",
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#9ca3af",
    marginBottom: "20px",
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
    padding: "10px 14px",
    borderRadius: "999px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    background: loading
      ? "linear-gradient(135deg,#6b7280,#4b5563)"
      : "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#020617",
    boxShadow: loading ? "none" : "0 8px 16px rgba(34,197,94,0.25)",
    whiteSpace: "nowrap",
    opacity: loading ? 0.7 : 1,
  };

  const outlineButtonStyle = {
    padding: "9px 14px",
    borderRadius: "999px",
    border: "1px solid #4b5563",
    fontSize: "13px",
    fontWeight: "500",
    cursor: loading ? "not-allowed" : "pointer",
    background: "transparent",
    color: "#e5e7eb",
    whiteSpace: "nowrap",
    opacity: loading ? 0.7 : 1,
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

  const historyWrapperStyle = {
    marginTop: "24px",
    borderTop: "1px solid #1f2937",
    paddingTop: "16px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  };

  const thStyle = {
    textAlign: "left",
    padding: "8px",
    borderBottom: "1px solid #1f2937",
    color: "#9ca3af",
    fontWeight: "600",
  };

  const tdStyle = {
    padding: "8px",
    borderBottom: "1px solid #111827",
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div style={titleRow}>
          <h1 style={{ fontSize: "28px", fontWeight: 700 }}>Hesap Makinesi</h1>
          <button style={logoutButtonStyle} onClick={handleLogout}>
            Çıkış Yap
          </button>
        </div>

        <p style={subtitleStyle}>
          İşlemi seç, sayıları gir ve sonucu anında gör. Aşağıda tüm işlem
          geçmişini de filtreleyip yönetebilirsin.
        </p>

        {/* Form */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "14px",
          }}
        >
          <div>
            <label style={labelStyle}>Sayı 1</label>
            <input
              type="number"
              style={inputStyle}
              placeholder="Örn: 12"
              value={sayi1}
              onChange={(e) => setSayi1(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Sayı 2</label>
            <input
              type="number"
              style={inputStyle}
              placeholder={islem === "karekök" ? "Bu işlem için isteğe bağlı" : "Örn: 5"}
              value={sayi2}
              onChange={(e) => setSayi2(e.target.value)}
              disabled={islem === "karekök"}
            />
          </div>

          <div>
            <label style={labelStyle}>İşlem</label>
            <select
              style={selectStyle}
              value={islem}
              onChange={(e) => {
                setIslem(e.target.value);
                if (e.target.value === "karekök") setSayi2("");
              }}
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

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button style={buttonStyle} onClick={hesapla} disabled={loading}>
            {loading ? "Hesaplanıyor..." : "Hesapla"}
          </button>

          <button style={outlineButtonStyle} onClick={gecmisiTemizle} disabled={loading}>
            Geçmişi Temizle
          </button>
        </div>

        {hata && <div style={errorStyle}>{hata}</div>}

        {sonuc !== null && (
          <div style={resultStyle}>
            Sonuç: <span>{sonuc}</span>
          </div>
        )}

        {filtrelenmisGecmis && filtrelenmisGecmis.length > 0 && (
          <div style={historyWrapperStyle}>
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ fontSize: "16px" }}>İşlem Geçmişi</h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#9ca3af" }}>Filtre:</span>
                <select
                  style={{
                    ...selectStyle,
                    width: "150px",
                    padding: "6px 10px",
                    fontSize: "13px",
                  }}
                  value={filterIslem}
                  onChange={(e) => setFilterIslem(e.target.value)}
                >
                  <option value="hepsi">Hepsi</option>
                  <option value="toplama">Toplama</option>
                  <option value="çıkarma">Çıkarma</option>
                  <option value="çarpma">Çarpma</option>
                  <option value="bölme">Bölme</option>
                  <option value="üs">Üs</option>
                  <option value="karekök">Karekök</option>
                </select>
              </div>
            </div>

            <div style={{ maxHeight: "260px", overflowY: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>İşlem</th>
                    <th style={thStyle}>Sayı 1</th>
                    <th style={thStyle}>Sayı 2</th>
                    <th style={thStyle}>Sonuç</th>
                    <th style={thStyle}>Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrelenmisGecmis.map((item, index) => (
                    <tr key={index}>
                      <td style={tdStyle}>{item.islem}</td>
                      <td style={tdStyle}>{item.sayi1}</td>
                      <td style={tdStyle}>{item.sayi2 !== null ? item.sayi2 : "-"}</td>
                      <td style={tdStyle}>{item.sonuc}</td>
                      <td style={tdStyle}>
                        {item.timestamp ?? item.created_at ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
