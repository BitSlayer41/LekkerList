// Admin product management — super_admin and content_admin only
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Popconfirm, Spin, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { deleteProduct } from "../../actions/products";
import useAdminRole from "../../components/hooks/useAdminRole";
import API_BASE from "../../config";
import "./Products.css";

export default function Products() {
  const dispatch = useDispatch();

  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;

  // Only super_admin and content_admin can manage products
  const { canManageProducts } = useAdminRole(userInfo);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/getProducts.php`);
        const json = await res.json();
        setProducts(json?.data?.products ?? []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = (productId) => {
    // Pass requesting_id so PHP can verify admin permission
    dispatch(deleteProduct(productId, userInfo?.id));
    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  console.log("userInfo:", userInfo);
  console.log("adminRole:", userInfo?.admin_role);
  console.log("canManageProducts:", canManageProducts);
  // Block non-admins
  if (!canManageProducts) {
    return (
      <div className="productsPage">
        <div className="productsAccessDenied">
          <h2>Access Denied</h2>
          <p>
            You need Super Admin or Content Admin privileges to manage products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="productsPage">
      <div className="productsHeader">
        <h1 className="productsTitle">Product Management</h1>
        <p className="productsSubtitle">
          {loading
            ? "Loading..."
            : `${products.length} product${products.length !== 1 ? "s" : ""} listed`}
        </p>
      </div>

      {loading ? (
        <div className="productsLoading">
          <Spin size="large" />
        </div>
      ) : products.length === 0 ? (
        <div className="productsEmpty">
          <p>No products found.</p>
        </div>
      ) : (
        <table className="productsTable">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Seller</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                {/* Image */}
                <td>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="productsTableImg"
                    />
                  ) : (
                    <div className="productsTableImgPlaceholder">No Image</div>
                  )}
                </td>

                {/* Title */}
                <td>
                  <div className="productsTableTitle">{p.title}</div>
                  <div className="productsTableDesc">
                    {p.description?.slice(0, 60)}
                    {p.description?.length > 60 ? "…" : ""}
                  </div>
                </td>

                {/* Category */}
                <td>{p.category ?? "—"}</td>

                {/* Price */}
                <td>R {Number(p.price).toFixed(2)}</td>

                {/* Status */}
                <td>
                  <Tag
                    color={
                      p.status === "active"
                        ? "green"
                        : p.status === "sold"
                          ? "blue"
                          : p.status === "inactive"
                            ? "default"
                            : "default"
                    }
                  >
                    {p.status}
                  </Tag>
                </td>

                {/* Seller */}
                <td>{p.seller_name ?? `#${p.seller_id}`}</td>

                {/* Actions */}
                <td className="productsTableActions">
                  <Popconfirm
                    title="Delete this product?"
                    description="This cannot be undone."
                    onConfirm={() => handleDelete(p._id)}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                  >
                    <button className="DeleteBtn">Delete</button>
                  </Popconfirm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
