import { useState } from "react";
import { clientAPI, setAuthToken } from "../api/api";

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await clientAPI.post("/auth/login", {
        username,
        password,
      });
      const token = res.data.token || res.data.access_token || res.data.accessToken;
      if (!token) {
        throw new Error('Token alınamadı: ' + JSON.stringify(res.data));
      }
      setAuthToken(token);
      onLoginSuccess && onLoginSuccess(token);
    } catch (err) {
      console.error("LOGIN HATA:", err);
      setError("Giriş başarısız. Kullanıcı adı veya şifre hatalı.");
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
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#020617",
    borderRadius: "16px",
    padding: "24px 28px",
    boxShadow: "0 24px 40px rgba(0,0,0,0.6)",
    color: "#e5e7eb",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "6px",
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
    marginBottom: "12px",
  };

  const buttonStyle = {
    width: "100%",
    marginTop: "8px",
    padding: "10px 12px",
    borderRadius: "999px",
    border: "none",
    fontSize: "15px",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    background: loading
      ? "linear-gradient(135deg,#6b7280,#4b5563)"
      : "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#020617",
    boxShadow: loading
      ? "none"
      : "0 14px 26px rgba(34,197,94,0.25)",
  };

  const errorStyle = {
    marginTop: "10px",
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "#450a0a",
    border: "1px solid #f97373",
    fontSize: "13px",
    color: "#fecaca",
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Giriş Yap</h1>
        <p style={subtitleStyle}>
          Devam etmek için kullanıcı adı ve şifrenle giriş yap.
          <br />
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
            (Demo kullanıcı: <b>admin</b> / <b>1234</b>)
          </span>
        </p>

        <label style={labelStyle}>Kullanıcı Adı</label>
        <input
          style={inputStyle}
          type="text"
          placeholder="admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label style={labelStyle}>Şifre</label>
        <input
          style={inputStyle}
          type="password"
          placeholder="1234"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={buttonStyle} onClick={handleLogin} disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        {error && <div style={errorStyle}>{error}</div>}
      </div>
    </div>
  );
}
