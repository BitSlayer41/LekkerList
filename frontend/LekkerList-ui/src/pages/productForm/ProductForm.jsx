import { useDispatch, useSelector } from "react-redux";
import { createProduct, updateProduct } from "../../actions/products";
import { Card, Typography } from "antd";

const { Title } = Typography;

const initialState = {
  product_title: "",
  product_description: "",
  product_price: "",
  product_image: "",
  category_id: "",
  status: "active",
  seller_id: "",
};

const ProductForm = ({ selectedProduct, setSelectedProduct }) => {
  const dispatch = useDispatch();

  // Get seller_id from logged-in user
  const authData = useSelector((state) => state.authentication?.authData);
  const user =
    authData || JSON.parse(localStorage.getItem("profile") || "null");

  const userInfo = user?.user;

  const formData = selectedProduct ?? initialState;

  const handleChange = (e) => {
    setSelectedProduct({
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
      setSelectedProduct({
        ...formData,
        product_image: reader.result,
      });
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    if (selectedProduct?.id) {
      dispatch(updateProduct(selectedProduct._id, payload));
    } else {
      dispatch(createProduct(payload));
    }

    setSelectedProduct(null);
  };

  const reset = () => setSelectedProduct(null);

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>{selectedProduct ? "Edit Product" : "Add Product"}</h2>

      <div className="container">
        <label>Title</label>
        <input
          name="product_title"
          value={formData.product_title}
          onChange={handleChange}
          placeholder="Title"
          className="productInput"
          required
        />
      </div>

      <div className="container">
        <label>Description</label>
        <textarea
          name="product_description"
          value={formData.product_description}
          onChange={handleChange}
          className="productInput"
        />
      </div>

      <div className="container">
        <label>Price (R)</label>
        <input
          type="number"
          name="product_price"
          value={formData.product_price}
          onChange={handleChange}
          className="productInput"
          required
        />
      </div>

      <div className="conatiner">
        <label>Image</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {formData.product_image && (
          <img
            src={formData.product_image}
            alt="preview"
            className="productImage"
          />
        )}
      </div>

      <button type="submit" style={{ marginRight: 8 }}>
        {selectedProduct ? "Update" : "Add"}
      </button>

      {selectedProduct && (
        <button type="button" onClick={reset}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default ProductForm;
