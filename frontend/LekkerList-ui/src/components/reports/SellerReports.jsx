// Seller reports
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Spin, Tag } from "antd";
import useAdminRole from "../hooks/useAdminRole";
import "./SellerReports.css";

export default function SellerReports() {
  const authData = useSelector((state) => state.authentication?.authData);

  const userInfo = authData?.user ?? null;

  // Only the super admin can manage the reports
  const { canManageAdmins, adminRole } = useAdminRole(userInfo);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo?.id || !canManageAdmins) return;

    const fetchReports = async () => {
      try {
        const res = await fetch(
          `http://localhost/LekkerList/backend/api/getReports.php?requesting_id=${userInfo.id}`,
        );

        const json = await res.json();

        setReports(json?.reports ?? []);
      } catch (err) {
        console.error("failed to fetch reports: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [userInfo, canManageAdmins]);

  const updateReportStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost/LekkerList/backend/api/getReports.php?requesting_id=${userInfo.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r)),
        );
      } else {
        alert(data.error || "failed to update report");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Block non supers
  if (adminRole !== "super_admin") {
    return (
      <div className="reportsPage">
        <div className="AccessDenied">
          <h2>Access Denied</h2>
          <p>Only Super Admins can manage seller reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reportsPage">
      <div className="reportsHeader">
        <h1 className="reportsTitle">Seller Reports</h1>

        <p className="reportsSubtitle">
          {loading
            ? "Loading..."
            : `${reports.length} report${reports.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {loading ? (
        <div className="reportsLoading">
          <Spin size="large" />
        </div>
      ) : reports.length === 0 ? (
        <div className="reportsEmpty">
          <p>No seller has been reported</p>
        </div>
      ) : (
        <table className="reportsTable">
          <thead>
            <tr>
              <th>Order</th>
              <th>Reporter</th>
              <th>Reported Seller</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                {/* Order */}
                <td>#{report.order_id}</td>

                {/* Reporter */}
                <td>
                  <div className="reportsUser">
                    {report.reporter_firstname} {report.reporter_lastname}
                  </div>

                  <div className="reportsEmail">{report.reporter_email}</div>
                </td>

                {/* Reported Seller */}
                <td>
                  <div className="reportsUser">
                    {report.reported_firstname} {report.reported_lastname}
                  </div>

                  <div className="reportsEmail">{report.reported_email}</div>
                </td>

                {/* Reason */}
                <td className="reportsReason">{report.reason}</td>

                {/* Status */}
                <td>
                  <Tag
                    color={
                      report.status === "pending"
                        ? "orange"
                        : report.status === "reviewed"
                          ? "green"
                          : "red"
                    }
                  >
                    {report.status}
                  </Tag>
                </td>

                {/* Date */}
                <td>
                  {new Date(report.created_at).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                {/* Actions */}
                <td className="reportsActions">
                  <Button
                    type="primary"
                    onClick={() => updateReportStatus(report.id, "reviewed")}
                    className="reviewBtn"
                  >
                    Review
                  </Button>

                  <Button
                    danger
                    type="primary"
                    onClick={() => updateReportStatus(report.id, "dismissed")}
                    disabled={report.status === "dismissed"}
                    className="dismissBtn"
                  >
                    Dismiss
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
