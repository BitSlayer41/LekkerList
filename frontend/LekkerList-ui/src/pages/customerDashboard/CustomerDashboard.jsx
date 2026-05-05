// Customer dashboard
import { useSelector } from "react-redux";
import "./CustomerDashboard.css";
import LatestProducts from "../../components/latestProducts/LatestProducts";
import RecentMessages from "../../components/recentMessages/RecentMessages";

export default function CustomerDashboard() {
  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;
  const diplayName = userInfo
    ? `${userInfo.firstname} ${userInfo.lastname}`.trim()
    : "Guest";

  return (
    <div className="dashboardLayout">
      <div className="dashboardMain">
        <main className="dashboardContent">
          <div className="dashboardWelcome">
            <h1 className="dashboardWelcomeTitle">
              Welcome Back, {diplayName}!
            </h1>
          </div>
          <div className="dashboardGrid">
            <div className="dashboardCol">
              <LatestProducts />
            </div>
            <div className="dashboardCol">
              <RecentMessages />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
