// Browse and filter products
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Spin, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../../actions/products";
import Product from "../product/Product";
import SearchBar from "../../components/searchBar/SearchBar";
import "./BrowseProducts.css";

const { Option } = Select;

const CATEGORIES = [
  "All",
  "Car Parts",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Music",
  "Sport & Fitness",
];

export default function BrowseProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "All";
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products;

    // Filter by category
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.seller_name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [products, category, searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleChangeCategory = (value) => {
    setSearchQuery("");
    value === "All" ? setSearchParams({}) : searchParams({ category: value });
  };

  if (!products || products.length === 0) {
    return (
      <div>
        <SearchBar onSearch={handleSearch} query={searchQuery} />
        <div className="browseCentre">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SearchBar onSearch={handleSearch} query={searchQuery} />
      <div className="browseFilter">
        <Select
          value={category}
          onChange={handleChangeCategory}
          className="browseSelect"
        >
          {CATEGORIES.map((cat) => (
            <Option key={cat} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>

        {(searchQuery || category !== "All") && (
          <span className="browseResult">
            {filteredProducts.length} result
            {filteredProducts.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
          </span>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="browseCentre">
          <p className="browseNoResults">
            No products found{searchQuery ? ` for "${searchQuery}"` : ""}.
          </p>
        </div>
      ) : (
        <Row gutter={[48, 32]} className="browseGrid">
          {filteredProducts.map((product) => (
            <Col key={product._id} lg={24} xl={24} xxl={8}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
