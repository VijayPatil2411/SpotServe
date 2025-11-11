// src/services/customerService.js
import api from "./api";

export const getAllServices = async () => {
  const res = await api.get("/api/services");
  return res.data;
};
