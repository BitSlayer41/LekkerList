// Dshaboard widget: 5 newest products
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LatestProducts.css";
import IconVerified from "../../images/shield-check.svg?react";

export default function LatestProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(
          "http://localhost/LekkerList/backend/api/getProducts.php",
        );

        const data = await res.json();

        const all = data?.data?.products ?? [];
        console.log("RAW PRODUCTS: ", all);

        const sorted = [...all].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        const latest = sorted.slice(0, 5);
        console.log("LATEST PRODUCTS: ", latest);

        setProducts(latest);
      } catch (err) {
        console.error("Failed to fetch latest products ", err);
      }
    };

    fetchLatest();
  }, []);

  return (
    <div className="latestProductCard">
      <div className="cardHeader">
        <h3 className="cardTitle">Latest Products</h3>
        <Link to="/browseProducts" className="cardLink">
          View All
        </Link>
      </div>
      <div className="latestProductsList">
        {products.map((p, i) => (
          <div
            key={p._id}
            className={`latestProductsRow ${i < products.length - 1 ? "latestProductsRowBordered" : ""}`}
          >
            <img
              src={p.image || "/placeholder.png"}
              alt={p.title}
              className="latestProductsImg"
            />

            <div className="latestProductsInfo">
              <span className="latestProductsName">{p.title}</span>
              <span className="latestProductsPrice">
                R{Number(p.price).toFixed(2)}
              </span>
              <span className="latestProductsSeller">
                <IconVerified className="icon" />
                Seller {p.seller_name}
              </span>
            </div>

            <button
              className="btnView"
              onClick={() => navigate(`/product/${p.id}`)}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
