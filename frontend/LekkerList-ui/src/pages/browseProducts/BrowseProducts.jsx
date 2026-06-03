// ── Browse all products ──
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Spin, Empty, Select } from "antd";
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
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products);

  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "All";

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];

    let result = products;

    // ── Filter by category ──
    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    // ── Filter by search query ──
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

  const handleSearch = (query) => setSearchQuery(query);

  const handleCategoryChange = (value) => {
    setSearchQuery("");
    value === "All"
      ? setSearchParams({})
      : setSearchParams({ category: value });
  };

  if (!products) {
    return (
      <div className="browseCentre">
        <Spin size="large" description="Loading products..." />
      </div>
    );
  }

  return (
    <div className="browseContainer">
      {/* ── Search + Filter bar ── */}
      <div className="browseToolbar">
        <SearchBar onSearch={handleSearch} query={searchQuery} />

        <Select
          value={category}
          onChange={handleCategoryChange}
          className="browseSelect"
        >
          {CATEGORIES.map((cat) => (
            <Option key={cat} value={cat}>
              {cat}
            </Option>
          ))}
        </Select>

        {/* ── Result count ── */}
        {(searchQuery || category !== "All") && (
          <span className="browseResultCount">
            {filteredProducts.length} result
            {filteredProducts.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
          </span>
        )}
      </div>

      {/* ── Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="browseCentre">
          <Empty
            description={
              <span className="browseEmptyText">
                {searchQuery
                  ? `No products found for "${searchQuery}"`
                  : "No products found in this category"}
              </span>
            }
          />
        </div>
      ) : (
        <Row gutter={[32, 32]}>
          {filteredProducts.map((product) => (
            <Col key={product._id} xs={24} sm={12} lg={8} xl={6}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
