import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Spin } from "antd";
import { getProducts } from "../../actions/products";
import Product from "../product/Product";
import "./ProductList.css";

const ProductList = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  if (!products || products.length === 0) {
    return (
      <div className="productListCentre">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={[48, 32]} className="productListGrid">
      {products.map((product) => (
        <Col key={product._id} lg={24} xl={12} xxl={8}>
          <Product product={product} />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;
