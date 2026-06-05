import React, { useEffect, useCallback, useState } from "react";
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
import Star from "../../images/star.svg?react";

export default function Sidebar({ isOpen, onClose, activeNav, onNavChange }) {
  const dispatch = useDispatch();

  const authData = useSelector((state) => state.authentication?.authData);

  const [switching, setSwitching] = useState(false);

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
      } catch (err) {
        console.error("Sidebar auth restore failed:", err);
      }
    }
  }, [authData, dispatch]);

  const userInfo = authData?.user ?? null;
  const isLoggedIn = !!userInfo;
  const role = userInfo?.role ?? "guest";
  const adminRole = userInfo?.admin_role ?? null;
  const finalRole = role === "admin" ? adminRole || "super_admin" : role;
  const userImage = userInfo?.image ?? null;

  const displayName = userInfo
    ? `${userInfo.firstname} ${userInfo.lastname}`.trim()
    : "Guest";

  const avatarLetter = userInfo?.firstname?.charAt(0)?.toUpperCase() ?? "G";

  const ROLE_BADGE = {
    super_admin: { label: "Super Admin", color: "#E8622A" },
    content_admin: { label: "Content Admin", color: "#2BBFB3" },
    finance_admin: { label: "Finance Admin", color: "#ffffff" },
    seller: { label: "Seller", color: "#2BBfB3" },
    customer: { label: "Customer", color: "#6B7280" },
    guest: { label: "Guest", color: "#6B7280" },
  };

  const badge = ROLE_BADGE[finalRole] ?? ROLE_BADGE.guest;

  const handleLogout = useCallback(() => {
    dispatch({ type: LOGOUT });
    window.location.href = "http://localhost:5173/";
  }, [dispatch]);

  const handleRoleSwitch = async () => {
    if (!userInfo?.id || switching) return;
    setSwitching(true);

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/users.php",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userInfo.id,
            requestingId: userInfo.id,
            switchRole: true,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        const currentSession = JSON.parse(localStorage.getItem("profile"));
        const updateSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            role: data.new_role,
            admin_role: null,
          },
        };

        localStorage.setItem("profile", JSON.stringify(updateSession));
        dispatch({ type: AUTHENTICATION, data: updateSession });
        onClose();

        window.location.href = "http://localhost:5173/";
      } else {
        alert(authData.error || "Failed to switch role");
      }
    } catch (err) {
      console.error("Role switch error: ", err);
      alert("Server error. Please try again");
    } finally {
      setSwitching(false);
    }
  };

  const canSwitchRole = role === "customer" || role === "seller";
  const switchLabel =
    role === "customer" ? "Switch to Selller" : "Switch to Customer";

  const navItems = [
    {
      href: "/",
      label: "Home",
      nav: "Home",
      icon: <HomeIcon className="sidenavIcon" />,
      roles: [
        "guest",
        "customer",
        "seller",
        "super_admin",
        "content_admin",
        "finance_admin",
      ],
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      nav: "Dashboard",
      icon: <DashboardIcon className="sidenavIcon" />,
      roles: ["seller", "super_admin", "content_admin", "finance_admin"],
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
      roles: ["guest", "customer", "seller"],
    },
    {
      href: "/addProduct",
      label: "Add Product",
      nav: "Add Products",
      icon: <ProductsIcon className="sidenavIcon" />,
      roles: ["seller"],
    },
    {
      href: "/reviews",
      label: "Reviews",
      nav: "Reviews",
      icon: <Star className="sidenavIcon" />,
      roles: ["guest", "customer", "seller", "super_admin", "content_admin"],
    },
    {
      href: "/allMessages",
      label: "Messages",
      nav: "Messages",
      icon: <MessagesIcon className="sidenavIcon" />,
      roles: [
        "customer",
        "seller",
        "super_admin",
        "content_admin",
        "finance_admin",
      ],
    },
    {
      href: "/transactions",
      label: "Transactions",
      nav: "Transactions",
      icon: <TransactionIcon className="sidenavIcon" />,
      roles: ["customer", "super_admin", "finance_admin", "seller"],
    },
    {
      href: "/profile",
      label: "Profile",
      nav: "Profile",
      icon: <UserIcon className="sidenavIcon" />,
      roles: [
        "customer",
        "seller",
        "super_admin",
        "content_admin",
        "finance_admin",
      ],
    },
    {
      href: "/admin",
      label: "Admin",
      nav: "Admin",
      icon: <DashboardIcon className="sidenavIcon" />,
      roles: ["super_admin", "content_admin", "finance_admin"],
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
          .filter((i) => i.roles.includes(finalRole))
          .map((item) => (
            <Link
              key={item.nav}
              to={item.href}
              className={`sidenavLink ${activeNav === item.nav ? "sidenavLinkActive" : ""}`}
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

        <div className="sidenavBtnRow">
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

          {/* Role switch button */}
          {canSwitchRole && (
            <button
              className="sidenavSwitchBtn"
              onClick={handleRoleSwitch}
              disabled={switching}
              title={switchLabel}
            >
              {switching ? "Switching..." : switchLabel}
            </button>
          )}
        </div>
      </div>

      {isOpen && <div className="sidenavOverlay" onClick={onClose} />}
    </>
  );
}
