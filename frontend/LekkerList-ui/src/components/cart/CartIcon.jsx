// Cart icon button badge
import { useState } from "react";
import { useCart } from "./useCart";
import CartDrawer from "./CartDrawer";
import ShoppingCart from "../../emoji/shopping-cart.png";
import "./CartIcon.css";

export default function CartIcon() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="cartIconBtn" onClick={() => setOpen(true)}>
        <img src={ShoppingCart} className="emoji" alt="Cart" />
        {count > 0 && <span className="cartBadge">{count}</span>}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
