// Product card with role-based actions
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Image, Button, Popconfirm, message } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { deleteProduct } from "../../actions/products";
import { useCart } from "../../components/cart/useCart.js";
import "./Product.css";

const { Paragraph, Text } = Typography;

export default function Product({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;
  const role = userInfo?.role ?? "guest";

  const isOwner = userInfo && String(userInfo.id) === String(product.seller_id);
  const isCustomer = role === "customer";

  const handleDelete = () => dispatch(deleteProduct(product._id));
  const handleUpdate = () => navigate(`/updateProduct/${product._id}`);
  const handleAddToCart = () => {
    addToCart(product);
    message.success(`${product.title} added to cart!`);
  };

  const buildActions = () => {
    const actions = [];

    if (isCustomer) {
      actions.push(
        <Button
          key="cart"
          type="text"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          className="cartBtn"
        >
          Add to Cart
        </Button>,
      );
    }

    if (isOwner) {
      actions.push(
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={handleUpdate}
        >
          Edit
        </Button>,
      );

      actions.push(
        <Popconfirm
          key="delete"
          title="Delete this product?"
          description="This cannot be undone."
          onConfirm={handleDelete}
          okText="Delete"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>,
      );
    }

    return actions.length > 0 ? actions : null;
  };

  return (
    <Card
      className="productCard"
      cover={
        product.image ? (
          <Image src={product.image} alt={product.title} />
        ) : (
          <div className="productImage">No Image</div>
        )
      }
      actions={buildActions()}
    >
      <Paragraph strong className="productTitle">
        {product.title}
      </Paragraph>
      <Paragraph
        style={{ margin: 0 }}
        ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
      >
        {product.description}
      </Paragraph>

      {product.seller_name && (
        <Paragraph className="productSeller">
          By {product.seller_name}
        </Paragraph>
      )}
      {product.category && (
        <Paragraph className="productCategory">{product.category}</Paragraph>
      )}

      <Text strong className="productPrice">
        R{Number(product.price).toFixed(2)}
      </Text>
      <br />
      <Text strong className="productStatus">
        {product.status}
      </Text>
    </Card>
  );
}
