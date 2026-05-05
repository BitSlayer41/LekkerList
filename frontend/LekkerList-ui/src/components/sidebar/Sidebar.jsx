import React, { useEffect, useCallback } from "react";
import "./Sidebar.css";
import logo from "../../images/companyLogo.jpeg";
import { LOGOUT, AUTHENTICATION } from "../../constants/actionTypes";

import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ProductsIcon from "../../images/tags.svg?react";
import HomeIcon from "../../images/home.svg?react";
import DashboardIcon from "../../images/apps.svg?react";
import MessagesIcon from "../../images/envelope.svg?react";
import TransactionIcon from "../../images/list.svg?react";
import UserIcon from "../../images/user.svg?react";

export default function Sidebar({ isOpen, onClose, activeNav, onNavChange }) {
  const dispatch = useDispatch();

  const authData = useSelector((state) => state.authentication?.authData);

  useEffect(() => {
    if (!authData) {
      try {
        const raw = localStorage.getItem("profile");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.user) {
            dispatch({ type: AUTHENTICATION, data: parsed });
          }
        }
      } catch {
        // ignore
      }
    }
  }, [authData, dispatch]);

  const userInfo = authData?.user ?? null;
  const userImage = userInfo?.image ?? null;
  const role = userInfo?.role ?? "guest";
  const isLoggedIn = !!userInfo;

  const displayName = userInfo
    ? `${userInfo.firstname} ${userInfo.lastname}`.trim()
    : "Guest";

  const avatarLetter = userInfo?.firstname?.charAt(0)?.toUpperCase() ?? "G";

  const ROLE_BADGE = {
    admin: { label: "Admin", color: "#E8622A" },
    seller: { label: "Seller", color: "#2BBfB3" },
    customer: { label: "Customer", color: "#6B7280" },
    guest: { label: "Guest", color: "#6B7280" },
  };

  const badge = ROLE_BADGE[role] ?? ROLE_BADGE.guest;

  const handleLogout = useCallback(() => {
    dispatch({ type: LOGOUT });
    window.location.href = "http://localhost:5173/";
  }, [dispatch]);

  const navItems = [
    {
      href: "/",
      label: "Home",
      nav: "Home",
      icon: <HomeIcon className="sidenavIcon" />,
      roles: ["guest", "customer", "admin", "seller"],
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      nav: "Dashboard",
      icon: <DashboardIcon className="sidenavIcon" />,
      roles: ["admin", "seller"],
    },
    {
      href: "/customerDashboard",
      label: "Dashboard",
      nav: "CustomerDashboard",
      icon: <DashboardIcon className="sidenavIcon" />,
      roles: ["customer"],
    },
    {
      href: "/myProducts",
      label: "My Products",
      nav: "MyProducts",
      icon: <ProductsIcon className="sidenavIcon" />,
      roles: ["seller"],
    },
    {
      href: "/browseProducts",
      label: "Browse Products",
      nav: "Browse Products",
      icon: <ProductsIcon className="sidenavIcon" />,
      roles: ["guest", "customer", "admin", "seller"],
    },
    {
      href: "/addProduct",
      label: "Add Product",
      nav: "Add Products",
      icon: <ProductsIcon className="sidenavIcon" />,
      roles: ["admin", "seller"],
    },
    {
      href: "/messages",
      label: "Messages",
      nav: "Messages",
      icon: <MessagesIcon className="sidenavIcon" />,
      roles: ["customer", "seller"],
    },
    {
      href: "/transactions",
      label: "Transactions",
      nav: "Transactions",
      icon: <TransactionIcon className="sidenavIcon" />,
      roles: ["customer", "admin", "seller"],
    },
    {
      href: "/profile",
      label: "Profile",
      nav: "Profile",
      icon: <UserIcon className="sidenavIcon" />,
      roles: ["customer", "admin", "seller"],
    },
    {
      href: "/admin",
      label: "Admin",
      nav: "Admin",
      icon: <DashboardIcon className="sidenavIcon" />,
      roles: ["admin"],
    },
  ];

  return (
    <>
      <div className="sidenav" style={{ width: isOpen ? "260px" : "0" }}>
        <button className="closeBtn" onClick={onClose}>
          &times;
        </button>

        <div className="sidebarBrand">
          <img src={logo} alt="LekkerList" className="sidenavLogo" />
        </div>

        <p className="sidenavTitle">LekkerList Marketplace</p>

        {navItems
          .filter((i) => i.roles.includes(role))
          .map((item) => (
            <Link
              key={item.nav}
              to={item.href}
              className={`sidenavLink${activeNav === item.nav ? "sidenavLinkActive" : ""}`}
              onClick={() => {
                onNavChange?.(item.nav);
                onClose();
              }}
            >
              {item.icon}
              <span className="sidenavLabel">{item.label}</span>
            </Link>
          ))}

        {/*User Card*/}
        <div className="sidenavUser">
          <div className="sidenavUserAvatar">
            {userImage ? (
              <img
                src={`http://localhost/Lekkerlist/backend/${userImage}`}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              avatarLetter
            )}
          </div>
          <div className="sidenavUserInfo">
            <span className="sidenavUserName">{displayName}</span>
            <span className="sidenavUserRole" style={{ color: badge.color }}>
              {badge.label}
            </span>
          </div>
        </div>

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="sidenavAuthBtn sidenavLogoutBtn"
          >
            Logout
          </button>
        ) : (
          <a
            href="http://localhost/LekkerList/backend/pages/login.html"
            className="sidenavAuthBtn"
          >
            Login
          </a>
        )}
      </div>

      {isOpen && <div className="sidenavOverlay" onClick={onClose} />}
    </>
  );
}
