import { useEffect, useState } from "react";
import { Rate, Spin, Empty, Select } from "antd";
import "./ReviewsPage.css";
import Star from "../../emoji/star.png";
const { Option } = Select;

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(
          "http://localhost/LekkerList/backend/api/getReviews.php",
        );
        const data = await res.json();
        if (data.success) setReviews(data.reviews ?? []);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const filtered =
    filter === "all"
      ? reviews
      : reviews.filter((r) => Number(r.rating) === Number(filter));

  // Average rating for all reviews
  const avgRating = reviews.length
    ? (
        reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
      ).toFixed(1)
    : 0;

  return (
    <div className="reviewsPage">
      {/* Header */}
      <div className="reviewsHeader">
        <div>
          <h1 className="reviewsTitle">Customer Reviews</h1>
          <p className="reviewsSubtitle">
            See what South Africans are saying about LekkerList sellers
          </p>
        </div>

        {/* Overal rating summary */}
        {!loading && reviews.length > 0 && (
          <div className="reviewsSummary">
            <span className="reviewsAvgScore">{avgRating}</span>
            <Rate disabled allowHalf value={Number(avgRating)} />
            <span className="reviewsTotal">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="reviewsToolbar">
        <Select value={filter} onChange={setFilter} style={{ width: 160 }}>
          <Option value="all">All Ratings</Option>
          <Option value="5">
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" /> (5 stars)
          </Option>
          <Option value="4">
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" /> (4 stars)
          </Option>
          <Option value="3">
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" /> (3 stars)
          </Option>
          <Option value="2">
            <img src={Star} alt="Star" className="emoji" />
            <img src={Star} alt="Star" className="emoji" /> (2 stars)
          </Option>
          <Option value="1">
            <img src={Star} alt="Star" className="emoji" /> (1 star)
          </Option>
        </Select>
        <span className="reviewCount">
          {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          {filter !== "all" &&
            ` with ${filter} star${filter === "1" ? "" : "s"}`}
        </span>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="reviewsCentre">
          <Spin size="large" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="reviewsCentre">
          <Empty description="No reviews found" />
        </div>
      ) : (
        <div className="reviewsList">
          {filtered.map((r) => (
            <div key={r.id} className="reviewCard">
              {/* Reviewer Avatar and Name */}
              <div className="reviewCardLeft">
                <div className="reviewAvatar">
                  {r.reviewer_image ? (
                    <img
                      src={`http://localhost/LekkerList/backend/${r.reviewer_image}`}
                      alt={r.firstname}
                    />
                  ) : (
                    <span>{r.firstname?.charAt(0)?.toUpperCase() ?? "?"}</span>
                  )}
                </div>
                <div className="reviewerInfo">
                  <span className="reviewerName">
                    {r.firstname} {r.lastname}
                  </span>
                  <span className="reviewDate">{formatDate(r.created_at)}</span>
                </div>
              </div>

              {/* Review Content */}
              <div className="reviewCardRight">
                <div className="reviewProduct">
                  <span className="reviewProductLabel">Product:</span>
                  <span className="reviewProductName">{r.product_title}</span>
                </div>

                {r.seller_firstname && (
                  <div className="reviewSeller">
                    <span className="reviewSellerLabel">Seller:</span>
                    <span className="reviewSellerName">
                      {r.seller_firstname} {r.seller_lastname}
                    </span>
                  </div>
                )}

                <Rate
                  disabled
                  value={Number(r.rating)}
                  className="reviewStars"
                />
                {r.comment && <p className="reviewComment">"{r.comment}"</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
