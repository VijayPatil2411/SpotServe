// src/services/adminService.js
import api from "./api";

const AdminService = {
  getServices: (token) => api.get("/admin/services", { headers: { Authorization: `Bearer ${token}` } }),
  createService: (payload, token) => api.post("/admin/services", payload, { headers: { Authorization: `Bearer ${token}` } }),
  updateService: (id, payload, token) => api.put(`/admin/services/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } }),
  deleteService: (id, token) => api.delete(`/admin/services/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  
  // ✅ NEW FEEDBACK FUNCTIONS
  getAllFeedback: (token) => api.get("/api/feedback/admin/all", { headers: { Authorization: `Bearer ${token}` } }),
  getFeedbackStats: (token) => api.get("/api/feedback/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
};

export default AdminService;
