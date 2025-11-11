import axios from "axios";

// Backend base URL (adjust if needed)
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global interceptor (optional but useful)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
