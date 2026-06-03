import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { updateProduct } from "../../actions/products";
import { Card, Typography, Button, message } from "antd";
import "./UpdateProduct.css";

const { Title } = Typography;

export default function UpdateProduct() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // Get product directly
  const existing = useSelector((state) =>
    state.products.find((p) => String(p._id) === String(id)),
  );

  const authData = useSelector((state) => state.authentication?.authData);
  const user = authData ?? JSON.parse(localStorage.getItem("profile"));
  const userInfo = user?.user;

  const [formData, setFormData] = useState({
    product_title: "",
    product_description: "",
    product_price: "",
    product_image: "",
    category_id: "",
    status: "active",
    seller_id: "",
  });

  useEffect(() => {
    if (existing) {
      setFormData({
        product_title: existing.product_title || "",
        product_description: existing.product_description || "",
        product_price: existing.product_price || "",
        product_image: existing.product_image || "",
        category_id: existing.category_id || "",
        status: existing.status || "active",
        seller_id: existing.seller_id || userInfo?.id || 0,
      });
    }
  }, [existing, userInfo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setFormData({ ...formData, product_image: reader.result });
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      product: {
        product_title: formData.product_title,
        product_description: formData.product_description,
        product_price: formData.product_price,
        product_image: formData.product_image,
        category_id: formData.category_id || "",
        status: formData.status || "active",
        seller_id: formData.seller_id || userInfo?.id || 0,
      },
    };

    try {
      await dispatch(updateProduct(id, payload));

      message.success("Product updated successfully");

      // small dely so user sees message
      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (err) {
      console.error(err);
      message.error("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (!existing) {
    return <div className="notExisting">Product not found.</div>;
  }

  return (
    <div className="updateProductPage">
      <Card className="updateProductCard">
        <Title level={3}>Edit Product</Title>

        <form onSubmit={handleSubmit} className="updateProductForm">
          <div className="updateField">
            <label>Title</label>
            <input
              name="product_title"
              value={formData.product_title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="updateField">
            <label>Description</label>
            <textarea
              name="product_description"
              value={formData.product_description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="updateField">
            <label>Price (R)</label>
            <input
              type="number"
              name="product_price"
              value={formData.product_price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="updateField">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleFile} />
            {formData.product_image && (
              <img
                src={formData.product_image}
                alt="preview"
                className="updateProductPreview"
              />
            )}
          </div>

          <div className="updateProductActions">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="updateSubmitBtn"
            >
              Update Product
            </Button>

            <Button
              htmlType="button"
              onClick={() => navigate("/")}
              className="updateCancelBtn"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
