import axios from "axios";

export const clientAPI = axios.create({
  baseURL: "http://client_api:6000"
});
