import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "antd";
import { useDispatch } from "react-redux";
import { AUTHENTICATION } from "./constants/actionTypes";

import Dashboard from "./pages/dashboard/Dashboard";
import AdminDashboard from "./pages/adminDashboard/AdminDashboard";
import CustomerDashboard from "./pages/customerDashboard/CustomerDashboard";
import ProductList from "./pages/productList/ProductList";
import Transactions from "./pages/transactions/Transactions";
import Home from "./pages/home/Home";
import AllMessages from "./pages/allMessages/Messages";
import Profile from "./pages/profile/ProfilePageWithApi";
import ProductForm from "./pages/productForm/ProductForm";
import BrowseProducts from "./pages/browseProducts/BrowseProducts";
import AddProduct from "./pages/addProduct/AddProduct";
import MyProducts from "./pages/myProducts/MyProducts";
import UpdateProduct from "./pages/updateProduct/UpdateProduct";
import OrderChat from "./pages/orderChat/OrderChat";

import RoleRoute from "./components/roleRoute/RoleRoute";
import Footer from "./components/footer/Footer";
import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import { CartProvider } from "./components/cart/CartProvider";

import "./App.css";

const PATH_TO_NAV = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/customerDashboard": "Dashboard",
  "/transactions": "Transactions",
  "/messages": "All Messages",
  "/profile": "Profile",
  "/browseProducts": "Browse Products",
  "/addProduct": "Add Products",
  "/myProducts": "My Products",
  "/admin": "Admin",
};

function AuthLoader({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");

    if (authParam) {
      try {
        const parsed = JSON.parse(atob(authParam));
        if (parsed?.user) {
          localStorage.setItem("profile", JSON.stringify(parsed));
          dispatch({ type: AUTHENTICATION, data: parsed });
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      } catch {
        // Ignore
      }
    } else {
      try {
        const raw = localStorage.getItem("profile");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user) {
            dispatch({ type: AUTHENTICATION, data: parsed });
          }
        }
      } catch {
        // Ignore
      }
    }
  }, [dispatch]);

  return children;
}

function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeNav = PATH_TO_NAV[location.pathname] || "Home";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
      <Layout>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeNav={activeNav}
          onNavChange={() => {}}
        />
        <div
          className={`dashboardMain ${sidebarOpen ? "dashboardMainShifted" : ""}`}
        >
          <Topbar
            activeNav={activeNav}
            onMenuToggle={() => setSidebarOpen((v) => !v)}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={["seller", "admin"]}>
                  <Dashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/customerDashboard"
              element={
                <RoleRoute allowedRoles={["customer"]}>
                  <CustomerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/addProduct"
              element={
                <RoleRoute allowedRoles={["seller", "admin"]}>
                  <AddProduct />
                </RoleRoute>
              }
            />
            <Route path="/transactions" element={<Transactions />} />

            <Route
              path="/messages"
              element={
                <RoleRoute allowedRoles={["seller", "customer"]}>
                  <AllMessages />
                </RoleRoute>
              }
            />
            <Route path="/chat/order/:orderId" element={<OrderChat />} />

            <Route
              path="/profile"
              element={
                <RoleRoute allowedRoles={["seller", "customer", "admin"]}>
                  <Profile />
                </RoleRoute>
              }
            />

            <Route path="/productForm" element={<ProductForm />} />
            <Route path="/browseProducts" element={<BrowseProducts />} />

            <Route
              path="/updateProduct/:id"
              element={
                <RoleRoute allowedRoles={["seller", "admin"]}>
                  <UpdateProduct />
                </RoleRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="/myProducts"
              element={
                <RoleRoute allowedRoles={["seller"]}>
                  <MyProducts />
                </RoleRoute>
              }
            />

            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </Layout>
      <Footer />
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AuthLoader>
          <AppLayout />
        </AuthLoader>
      </CartProvider>
    </BrowserRouter>
  );
}
