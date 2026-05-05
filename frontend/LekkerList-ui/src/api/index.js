import axios from "axios";

const api = axios.create({ baseURL: "http://localhost/LekkerList" });

// Attach Token
api.interceptors.request.use((req) => {
  if (localStorage.getItem("profile")) {
    const profile = JSON.parse(localStorage.getItem("profile"));
    req.headers.Authorization = `Bearer${profile.token}`;
  }

  return req;
});

// Products

export const fetchProducts = () => api.get("/backend/api/getProducts.php");

// Wrap proudct for PHP
export const createProduct = (product) =>
  api.post("/backend/api/createProduct.php", product);

export const updateProduct = (id, product) =>
  api.put(`/backend/api/updateProduct.php?id=${id}`, { product });

export const deleteProduct = (id) =>
  api.delete(`/backend/api/deleteProduct.php?id=${id}`);

// AUTH
export const login = (formValues) =>
  api.post("/backend/pages/login.html", formValues);

export const signup = (formValues) =>
  api.post("/backend/pages/register.html", formValues);
