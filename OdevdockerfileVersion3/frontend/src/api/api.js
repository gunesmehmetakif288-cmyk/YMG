import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// client_api'ye istek atan axios instance
export const clientAPI = axios.create({
  baseURL,
});

// Token'ı ayarlayan yardımcı fonksiyon
export const setAuthToken = (token) => {
  if (token) {
    clientAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("auth_token", token);
  } else {
    delete clientAPI.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
  }
};

// Sayfa yenilendiğinde localStorage'daki token'ı geri yükle
const saved = localStorage.getItem("auth_token");
if (saved) {
  clientAPI.defaults.headers.common["Authorization"] = `Bearer ${saved}`;
}
