// Dashboard stats: listings, items sold, earnings
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import "./StatsOverview.css";
import IconCart from "../../images/shopping-cart.svg?react";
import IconEarnings from "../../images/coins.svg?react";
import IconListings from "../../images/money-bill-wave.svg?react";

export default function StatsOverview() {
  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;
  const role = userInfo?.role ?? "guest";

  const [stats, setStats] = useState({
    activeListings: 0,
    itemsSold: 0,
    totalEarnings: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Active Listings
      const productsRes = await fetch(
        "http://localhost/LekkerList/backend/api/getProducts.php",
      );

      const productsData = await productsRes.json();
      const allProducts = productsData?.data?.products ?? [];

      const activeListings =
        role === "admin"
          ? allProducts.filter((p) => p.status === "active").length
          : allProducts.filter(
              (p) =>
                p.status === "active" &&
                String(p.seller_id) === String(userInfo.id),
            ).length;

      // Orders
      const ordersRes = await fetch(
        `http://localhost/LekkerList/backend/api/getTransactions.php?user_id=${userInfo.id}&role=${role}`,
      );

      const ordersData = await ordersRes.json();
      const orders = ordersData?.transactions ?? [];

      let itemsSold = 0;
      let totalEarnings = 0;

      orders.forEach((order) => {
        (order.items ?? []).forEach((item) => {
          itemsSold += Number(item.qty ?? 1);
        });

        totalEarnings += Number(order.total ?? 0);
      });

      setStats({ activeListings, itemsSold, totalEarnings });
    } catch (err) {
      console.error("StatsOverview fetch error: ", err);
    } finally {
      setLoading(false);
    }
  }, [userInfo, role]);

  useEffect(() => {
    if (userInfo?.id) fetchStats();
  }, [fetchStats, userInfo]);

  const STATS = [
    {
      icon: <IconListings className="icon" />,
      value: loading ? "-" : stats.activeListings,
      label: role === "admin" ? "Active Listings (All)" : "My Active Listings",
      mod: "orange",
    },
    {
      icon: <IconCart className="icon" />,
      value: loading ? "-" : stats.itemsSold,
      label: "Items Sold",
      mod: "teal",
    },
    {
      icon: <IconEarnings className="icon" />,
      value: loading ? "-" : `R${stats.totalEarnings.toFixed(2)}`,
      label: "Total Earnings",
      mod: "green",
    },
  ];

  return (
    <section className="statsOverview">
      <h2 className="statsOverviewHeading">Overview</h2>
      <div className="statsOverviewGrid">
        {STATS.map((s) => (
          <div key={s.label} className="statCard">
            <div className={`statCardIcon statCardIcon--${s.mod}`}>
              {s.icon}
            </div>
            <div>
              <div className="statCardValue">{s.value}</div>
              <div className="statCardLabel">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
