import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");

  const giris = () => {
    if (email === "test@test.com" && sifre === "1234") {
      localStorage.setItem("user", email);
      nav("/dashboard");
    } else {
      alert("Hatalı giriş!");
    }
  };

  return (
    <div>
      <h2>Giriş Yap</h2>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
      <input placeholder="Şifre" type="password" onChange={(e)=>setSifre(e.target.value)}/>
      <button onClick={giris}>Giriş</button>
    </div>
  );
}
