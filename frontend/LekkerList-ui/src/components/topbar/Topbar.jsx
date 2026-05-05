// Sticky Top bar with menu toggle and cart
import "./Topbar.css";
import MenuIcon from "../../images/menu-burger.svg?react";
import CartIcon from "../cart/CartIcon";

const IconMenu = () => <MenuIcon className="svgIcon" />;

export default function Topbar({ onMenuToggle, activeNav }) {
  const label = activeNav
    ? activeNav.charAt(0).toUpperCase() + activeNav.slice(1)
    : "Home";

  return (
    <header className="topbar">
      <button
        className="topbarMenu"
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
      >
        <IconMenu />
      </button>
      <span className="topbarBreadcrumb">{label}</span>
      <CartIcon />
    </header>
  );
}
