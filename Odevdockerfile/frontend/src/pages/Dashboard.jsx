import { useState } from "react";
import { clientAPI } from "../api/api";

export default function Dashboard() {
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [islem, setIslem] = useState("toplama");
  const [sonuc, setSonuc] = useState(null);

  const hesapla = async () => {
    let r = await clientAPI.post("/client/hesapla", {
      sayi1: Number(s1),
      sayi2: Number(s2),
      islem
    });
    setSonuc(r.data.cevap.sonuc);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <input placeholder="Sayı 1" onChange={(e)=>setS1(e.target.value)}/>
      <input placeholder="Sayı 2" onChange={(e)=>setS2(e.target.value)}/>
      <select onChange={(e)=>setIslem(e.target.value)}>
        <option>toplama</option>
        <option>çıkarma</option>
        <option>çarpma</option>
        <option>bölme</option>
        <option>üs</option>
      </select>
      <button onClick={hesapla}>Hesapla</button>
      {sonuc !== null && <h3>Sonuç: {sonuc}</h3>}
    </div>
  );
}
