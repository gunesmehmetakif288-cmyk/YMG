import { useState } from "react";
import { clientAPI } from "./api/api"; 

function App() {
  const [sayi1, setSayi1] = useState("");
  const [sayi2, setSayi2] = useState("");
  const [islem, setIslem] = useState("toplama");
  const [sonuc, setSonuc] = useState(null);
  const [gecmis, setGecmis] = useState([]);

  const hesapla = async () => {
    try {
      const payload = {
        sayi1: Number(sayi1),
        sayi2: sayi2 === "" ? null : Number(sayi2),
        islem: islem
      };

      const response = await clientAPI.post("/client/hesapla", payload);
      setSonuc(response.data.cevap.sonuc);

      // ✅ geçmişi yeniden çek
      const historyResponse = await clientAPI.get("/client/gecmis");
      setGecmis(historyResponse.data);

    } catch (error) {
      console.error("DETAYLI HATA:", error);
      alert("Hesaplama sırasında hata oluştu!");
    }
  };


  return (
    <div style={{ padding: "20px", fontFamily: "Arial", fontSize: "18px" }}>
      <h1>Hesap Makinesi</h1>

      <input
        type="number"
        placeholder="Sayı 1"
        value={sayi1}
        onChange={(e) => setSayi1(e.target.value)}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Sayı 2"
        value={sayi2}
        onChange={(e) => setSayi2(e.target.value)}
      />
      <br /><br />

      <select value={islem} onChange={(e) => setIslem(e.target.value)}>
        <option value="toplama">Toplama</option>
        <option value="çıkarma">Çıkarma</option>
        <option value="çarpma">Çarpma</option>
        <option value="bölme">Bölme</option>
        <option value="üs">Üs</option>
        <option value="karekök">Karekök</option>
      </select>

      <br /><br />

      <button onClick={hesapla}>Hesapla</button>

      {sonuc !== null && <h2>Sonuç: {sonuc}</h2>}

      {/* ✅ İşlem geçmişi tablosu */}
      {gecmis && gecmis.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>İşlem Geçmişi</h2>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>İşlem</th>
                <th>Sayı 1</th>
                <th>Sayı 2</th>
                <th>Sonuç</th>
                <th>Zaman</th>
              </tr>
            </thead>
            <tbody>
              {gecmis.map((item, index) => (
                <tr key={index}>
                  <td>{item.islem}</td>
                  <td>{item.sayi1}</td>
                  <td>{item.sayi2 !== null ? item.sayi2 : "-"}</td>
                  <td>{item.sonuc}</td>
                  <td>{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
