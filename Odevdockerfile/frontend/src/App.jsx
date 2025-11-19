import { useState } from "react";
import axios from "axios";

function App() {
  const [sayi1, setSayi1] = useState("");
  const [sayi2, setSayi2] = useState("");
  const [islem, setIslem] = useState("toplama");
  const [sonuc, setSonuc] = useState(null);

  const hesapla = async () => {
    try {
      const response = await axios.post("http://localhost:8000/client/hesapla", {
        sayi1: Number(sayi1),
        sayi2: Number(sayi2),
        islem
      });

      setSonuc(response.data.cevap.sonuc);

    } catch (error) {
      console.error("Hata:", error);
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
    </div>
  );
}

export default App;
