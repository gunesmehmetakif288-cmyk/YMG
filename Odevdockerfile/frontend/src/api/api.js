import axios from "axios";

export const clientAPI = axios.create({
  baseURL: "http://localhost:8000"
});
