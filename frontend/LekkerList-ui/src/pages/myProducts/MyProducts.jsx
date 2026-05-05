// Seller's own product listings
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Spin, Empty } from "antd";
import { Link } from "react-router-dom";
import { getProducts } from "../../actions/products";
import Product from "../product/Product";
import "./MyProducts.css";

export default function MyProducts() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.produtcs);
  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const myProducts = useMemo(() => {
    if (!Array.isArray(products) || !userInfo?.id) return [];
    return products.filter(
      (p) => p && String(p.seller_id) === String(userInfo.id),
    );
  }, [products, userInfo]);

  if (!products || !userInfo) {
    return (
      <div className="myProductsCentre">
        <Spin size="large" description="Fetching your inventory..." />
      </div>
    );
  }

  if (myProducts.length === 0) {
    return (
      <div className="myProductsCentre">
        <Empty
          description={
            <span className="myProductsEmptyText">
              You haven't listed any products yet.
            </span>
          }
        >
          <Link to="/addProduct" className="myProductsBtn">
            Create Listing
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div className="myProductsConatiner">
      <h2 className="myProductsTite">My Products</h2>
      <Row gutter={[32, 32]}>
        {myProducts.map((product) => (
          <Col key={product._id} xs={24} sm={12} lg={8} xl={6}>
            <Product product={product} />
          </Col>
        ))}
      </Row>
    </div>
  );
}
