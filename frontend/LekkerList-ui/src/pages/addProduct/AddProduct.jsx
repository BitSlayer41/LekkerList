import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct } from "../../actions/products";
import "./AddProduct.css";

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;

  const flashMessage = useSelector((state) => state.flashMessage);

  // blocked status
  const isBlocked = Number(userInfo?.is_blocked) === 1;

  const [formData, setFormData] = useState({
    product_title: "",
    product_description: "",
    product_price: "",
    product_image: "",
    category_id: "",
    status: "active",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        product_image: reader.result,
      }));
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!userInfo?.id) {
      alert("Please log in to add a product");
      return;
    }

    // BLOCKED SELLER GUARD
    if (isBlocked) {
      alert("You are blocked and cannot add products.");
      return;
    }

    const fullName =
      `${userInfo?.firstname ?? ""} ${userInfo?.lastname ?? ""}`.trim();

    const finalData = {
      requesting_id: userInfo.id,
      product: {
        ...formData,
        product_price: Number(formData.product_price),
        seller_id: userInfo.id,
        seller_name: fullName,
      },
    };

    dispatch(createProduct(finalData));
    navigate("/myProducts");
  };

  // BLOCKED UI SCREEN
  if (isBlocked) {
    return (
      <div className="addProductContainer blockedSeller">
        <h2>Access Restricted</h2>
        <p className="blockedMessage">
          Your seller account has been blocked. You cannot add new products.
          Please contact support or an admin for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="addProductContainer">
      <h2>Add New Product</h2>

      <form onSubmit={handleSubmit}>
        <div className="formGroup">
          <label>Title</label>
          <input
            name="product_title"
            value={formData.product_title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formGroup">
          <label>Description</label>
          <textarea
            name="product_description"
            value={formData.product_description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formGroup">
          <label>Price (R)</label>
          <input
            type="number"
            name="product_price"
            value={formData.product_price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="formGroup">
          <label>Image</label>
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div className="formGroup">
          <label>Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Car Parts">Car Parts</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Home & Garden">Home & Garden</option>
            <option value="Music">Music</option>
            <option value="Sport & Fitness">Sport & Fitness</option>
          </select>
        </div>

        <div className="formGroup">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="submit">Add Product</button>

        {flashMessage && <p className="flashMessage">{flashMessage}</p>}
      </form>
    </div>
  );
};

export default AddProduct;
