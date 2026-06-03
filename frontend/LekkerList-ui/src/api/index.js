// Axios API client
import axios from "axios";
import API_BASE from "../config";

const BACKEND_BASE = API_BASE.replace("/api", "");

const api = axios.create({ baseURL: BACKEND_BASE });

// Attach token to every request
api.interceptors.request.use((req) => {
  const profile = localStorage.getItem("profile");
  if (profile) {
    const parsed = JSON.parse(profile);
    req.headers.Authorization = `Bearer ${parsed.token}`;
  }
  return req;
});

// Products
export const fetchProducts = () => api.get("/api/getProducts.php");
export const createProduct = (product) =>
  api.post("/api/createProduct.php", product);
export const updateProduct = (id, product) =>
  api.put(`/api/updateProduct.php?id=${id}`, { product });

export const deleteProduct = (id, requestingId) =>
  api.delete(`/api/deleteProduct.php?id=${id}`, {
    data: { requesting_id: requestingId },
  });
