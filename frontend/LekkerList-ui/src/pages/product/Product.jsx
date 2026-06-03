// ── Product card — seller sees edit/delete on their own listings only ──
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Image,
  Button,
  Popconfirm,
  message,
  Tag,
  Rate,
} from "antd";
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

  // ── Seller only sees actions on their OWN products ──
  const isOwner = userInfo && String(userInfo.id) === String(product.seller_id);
  const isCustomer = role === "customer";

  const handleDelete = () => {
    // Pass requesting_id so PHP verifies ownership
    dispatch(deleteProduct(product._id, userInfo?.id));
  };

  const handleUpdate = () => navigate(`/updateProduct/${product._id}`);

  const handleAddToCart = () => {
    addToCart(product);
    message.success(`${product.title} added to cart!`);
  };

  const buildActions = () => {
    const actions = [];

    if (isCustomer) {
      const isUnavailable =
        product.status === "inactive" || product.status === "sold";

      actions.push(
        <Button
          key="cart"
          type="text"
          icon={<ShoppingCartOutlined />}
          onClick={handleAddToCart}
          className="cartBtn"
          disabled={isUnavailable}
        >
          {product.status === "sold"
            ? "Sold"
            : product.status === "inactive"
              ? "Unavailable"
              : "Add to Cart"}
        </Button>,
      );
    }

    // ── Only the seller who owns this product gets edit/delete ──
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
        <div className="productImageWrapper">
          {product.image ? (
            <Image src={product.image} alt={product.title} preview={false} />
          ) : (
            <div className="productImage">No Image</div>
          )}
        </div>
      }
      actions={buildActions()}
    >
      <Paragraph strong className="productTitle">
        {product.title}
      </Paragraph>

      <Paragraph className="productDescription" ellipsis={{ rows: 2 }}>
        {product.description}
      </Paragraph>

      {product.category && (
        <Paragraph className="productCategory">{product.category}</Paragraph>
      )}

      {product.seller_name && (
        <Paragraph className="productSeller">
          By {product.seller_name}
          {product.is_verified ? (
            <Tag color="green" style={{ marginLeft: 8 }}>
              VERIFIED
            </Tag>
          ) : (
            <Tag style={{ marginLeft: 8 }}>UNVERIFIED</Tag>
          )}
        </Paragraph>
      )}

      <div className="productRating">
        <Rate disabled allowHalf value={Number(product.avg_rating || 0)} />
        <span className="productReviewCount">
          ({product.review_count || 0})
        </span>
      </div>

      <div className="productBottom">
        <Text strong className="productPrice">
          R {Number(product.price).toFixed(2)}
        </Text>
        <Tag
          color={
            product.status === "active"
              ? "green"
              : product.status === "sold"
                ? "gold"
                : "red"
          }
        >
          {product.status?.toUpperCase()}
        </Tag>
      </div>
    </Card>
  );
}
