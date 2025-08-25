
import axios from "axios";

const API = axios.create({
  baseURL: "https://letschat-backend-ryk4.onrender.com/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
