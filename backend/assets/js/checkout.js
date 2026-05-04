// Checkout page logic

// Load user from localStorage
let currentUser = null;
try {
  const profile = JSON.parse(localStorage.getItem("profile"));
  currentUser = profile?.user ?? null;
} catch {
  currentUser = null;
}

// Decode cart from URL param
let cartMinimal = [];
try {
  const cartParam = new URLSearchParams(window.location.search).get("cart");
  if (cartParam) {
    cartMinimal = JSON.parse(atob(cartParam));
    window.history.replaceState({}, document.title, window.location.pathname);
  }
} catch (e) {
  console.error("Cart decode error: ", e);
}

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  const orderItems = document.getElementById("orderItems");

  //Fetch full product details for cart IDs
  const loadCart = async () => {
    const safeCart = Array.isArray(cartMinimal)
      ? cartMinimal.filter((i) => i?._id)
      : [];
    const ids = safeCart.map((i) => i._id).filter(Boolean);

    if (ids.length === 0) {
      orderItems.innerHTML =
        '<p style="color: #9ca3af; text-align: center">Your cart is empty</p>';
      updateTotals();
      return;
    }

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/getCartProducts.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        },
      );

      const data = await res.json();

      cart = (data.products || []).map((p) => {
        const match = safeCart.find((i) => i._id == p.product_id);
        return {
          _id: p.product_id,
          seller_id: p.seller_id,
          title: p.product_title,
          price: Number(p.product_price),
          image: p.product_image || null,
          qty: match?.qty ?? 1,
        };
      });

      renderItems();
      updateTotals();
    } catch (err) {
      console.error("Cart load failed: ", err);
      orderItems.innerHTML =
        '<p style="color: red; text-align: center;"> Failed to load cart</p>';
    }
  };

  // Render order summary items
  const renderItems = () => {
    orderItems.innerHTML = "";
    cart.forEach((item) => {
      const div = document.createElement("div");
      div.className = "orderItem";
      div.innerHTML = `<div class="orderItemImg"> 
    ${item.image ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;" />` : ""}
    </div>
    <div class="orderItemDetails">
    <div class="orderItemName">${item.title}</div>
    <div class="orderItemQty">Qty: ${item.qty}</div>
    </div>    
    <div class="orderItemPrice">R ${(item.price * item.qty).toFixed(2)}</div>`;

      orderItems.appendChild(div);
    });
  };

  // Update subtotal / total
  const updateTotals = () => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    document.getElementById("subtotal").textContent =
      `R ${subtotal.toFixed(2)}`;
    document.getElementById("total").textContent = `R ${subtotal.toFixed(2)}`;
  };

  // Card number formatting
  document.getElementById("cardNumber").addEventListener("input", function () {
    const digits = this.value.replace(/\D/g, "").substring(0, 16);
    this.value = digits.match(/.{1,4}/g)?.join(" ") ?? "";
  });

  // Postal code (digits only, 4 chars)
  document.getElementById("postal").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").substring(0, 4);
  });

  // Clear the React cart in loacalStorage
  const clearCart = () => {
    localStorage.setItem("cart", JSON.stringify([]));
  };

  // Mark all purchased products as sold
  const markProductsSold = async (cartItems) => {
    const productIds = cartItems.map((i) => i._id).filter(Boolean);
    if (productIds.length === 0) return;

    try {
      await fetch(
        "http://localhost/LekkerList/backend/api/updateProductStatus.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_ids: productIds, status: "sold" }),
        },
      );
    } catch (err) {
      console.error("Failed to update product status: ", err);
    }
  };

  // Form submission
  document.getElementById("checkForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const errorBox = document.getElementById("errorBox");
    const submitBtn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");

    const required = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "street",
      "suburb",
      "city",
      "postal",
      "province",
      "cardName",
      "cardNumber",
      "expMonth",
      "expYear",
      "cvv",
    ];

    for (const id of required) {
      if (!document.getElementById(id).value.trim()) {
        errorBox.textContent = "Please fill in all required fields.";
        errorBox.classList.add("show");
        return;
      }
    }

    if (cart.length === 0) {
      errorBox.textContent = "Your cart is empty.";
      errorBox.classList.add("show");
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.textContent = "Processing...";
    spinner.style.display = "block";
    errorBox.classList.remove("show");

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const payload = {
      customer: {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
      },
      shipping: {
        street: document.getElementById("street").value.trim(),
        suburb: document.getElementById("suburb").value.trim(),
        city: document.getElementById("city").value.trim(),
        postal: document.getElementById("postal").value.trim(),
        province: document.getElementById("province").value.trim(),
      },

      cart: cart.map(({ _id, title, price, qty, seller_id, image }) => ({
        _id,
        title,
        price,
        qty,
        seller_id,
        image,
      })),
      total: subtotal,
      customer_id: currentUser?.id || null,
    };

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/processOrder.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (data.success) {
        // mark products as sold
        await markProductsSold(cart);

        // Clear the cart from localStorage
        clearCart();

        // Show success overlay
        document.getElementById("successOverlay").classList.add("show");
      } else {
        errorBox.textContent = data.error || "Payment failed";
        errorBox.classList.add("show");
      }
    } catch {
      errorBox.textContent = "Server error";
      errorBox.classList.add("show");
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = "Pay Now";
      spinner.style.display = "none";
    }
  });

  loadCart();
});

// Cancel checkout
const handleCancel = () => {
  if (confirm("Are you sure you want to cancel checkout?")) {
    window.location.href = "http://localhost:5173/";
  }
};
