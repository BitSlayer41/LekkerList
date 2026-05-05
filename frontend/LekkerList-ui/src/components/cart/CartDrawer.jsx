// Slide-out cart drawer
import { useCart } from "./useCart.js";
import "./CartDrawer.css";

export default function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, total, clearCart } = useCart();

  if (!open) return null;

  // Encode minimal cart and navigate to checkout
  const handleCheckout = () => {
    const cartMinimal = items.map(({ _id, qty }) => ({ _id, qty }));
    const encoded = btoa(JSON.stringify(cartMinimal));

    let profileEncoded = "";

    try {
      const raw = localStorage.getItem("profile");
      if (raw) profileEncoded = btoa(raw);
    } catch {
      // ignore
    }

    window.location.href = `http://localhost/LekkerList/backend/pages/checkout.html?cart=${encoded}&profile=${profileEncoded}`;
  };

  return (
    <>
      <div className="cartOverlay" onClick={onClose} />

      <div className="cartDrawer cartDrawerOpen">
        <div className="cartHeader">
          <h2 className="cartTitle">Your Cart</h2>
          <button className="cartClose" onClick={onClose}>
            X
          </button>
        </div>

        {items.lengthn === 0 ? (
          <div className="cartEmpty">Your cart is empty</div>
        ) : (
          <>
            <div className="cartItems">
              {items.map((item) => (
                <div key={item._id} className="cartItem">
                  <div className="cartItemInfo">
                    <div className="cartItemName">{item.title}</div>
                    <div className="cartItemPrice">
                      R{Number(item.price).toFixed(2)}
                    </div>
                  </div>
                  <button
                    className="cartItemRemove"
                    onClick={() => removeFromCart(item._id)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="cartFooter">
              <div className="cartTotal">
                <span>Total</span>
                <span className="cartTotalAmount">R{total.toFixed(2)}</span>
              </div>
              <button className="cartCheckoutBtn" onClick={handleCheckout}>
                Checkout
              </button>
              <button className="cartClearBtn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
