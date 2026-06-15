import { useEffect, useState } from "react";
import { Button, Spin, Tag } from "antd";
import "./SellerReports.css";

export default function SellerReports({ adminId, isSuperAdmin, setUsers }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeStatus = (status) => status?.toLowerCase().trim();

  const isPending = (status) => normalizeStatus(status) === "pending";

  const pendingReports = reports.filter((r) => isPending(r.status)).length;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  useEffect(() => {
    if (!isSuperAdmin || !adminId) return;

    const fetchReports = async () => {
      try {
        const res = await fetch(
          `http://localhost/LekkerList/backend/api/getReports.php?requesting_id=${adminId}`,
        );

        const data = await res.json();

        if (data.success) {
          setReports(data.reports ?? []);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [adminId, isSuperAdmin]);

  const updateReport = async (reportId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost/LekkerList/backend/api/getReports.php?requesting_id=${adminId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: reportId,
            status: newStatus,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setReports((prev) =>
          prev.map((report) =>
            report.id === reportId ? { ...report, status: newStatus } : report,
          ),
        );
      }
    } catch (err) {
      console.error("Error updating report:", err);
    }
  };

  const toggleBlockUser = async (id, current) => {
    const action = current ? "unblock" : "block";

    const confirmBlock = window.confirm(
      `Are you sure you want to ${action} this user?`,
    );

    if (!confirmBlock) return;

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/users.php",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            is_blocked: current ? 0 : 1,
            requestingId: adminId,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        if (setUsers) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === id ? { ...u, is_blocked: current ? 0 : 1 } : u,
            ),
          );
        }

        setReports((prev) =>
          prev.map((r) =>
            r.reported_id === id
              ? {
                  ...r,
                  reported_is_blocked: current ? 0 : 1,
                }
              : r,
          ),
        );
      }
    } catch (err) {
      console.error(`Error trying to ${action} user:`, err);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="reportsEmpty">
        <p>Only Super Admins can manage seller reports.</p>
      </div>
    );
  }

  return (
    <>
      <div className="reportsHeader">
        <h2 className="reportsTitle">
          Seller Reports
          {pendingReports > 0 && (
            <span className="reportsBadge">{pendingReports} pending</span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="reportsLoading">
          <Spin size="large" />
        </div>
      ) : reports.length === 0 ? (
        <div className="reportsEmpty">
          <p>No seller reports yet.</p>
        </div>
      ) : (
        <table className="reportsTable">
          <thead>
            <tr>
              <th>Order</th>
              <th>Reported By</th>
              <th>Reported Seller</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>#{r.order_id}</td>

                <td>
                  <div className="reportsUser">
                    {r.reporter_firstname} {r.reporter_lastname}
                  </div>
                  <div className="reportsEmail">{r.reporter_email}</div>
                </td>

                <td>
                  <div className="reportsUser">
                    {r.reported_firstname} {r.reported_lastname}
                    {Number(r.reported_is_blocked) === 1 && (
                      <span className="blockedBadge">Blocked</span>
                    )}
                  </div>

                  <div className="reportsEmail">{r.reported_email}</div>
                </td>

                <td className="reportsReason">{r.reason}</td>

                <td className="reportsDate">{formatDate(r.created_at)}</td>

                <td>
                  <Tag
                    color={
                      isPending(r.status)
                        ? "orange"
                        : normalizeStatus(r.status) === "reviewed"
                          ? "green"
                          : "default"
                    }
                  >
                    {r.status}
                  </Tag>
                </td>

                <td>
                  <div className="reportsActions">
                    {isPending(r.status) && (
                      <>
                        <Button
                          size="small"
                          className="reviewBtn"
                          onClick={() => updateReport(r.id, "reviewed")}
                        >
                          Mark Reviewed
                        </Button>

                        <Button
                          size="small"
                          className="dismissBtn"
                          onClick={() => updateReport(r.id, "dismissed")}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}

                    {r.reported_id && (
                      <button
                        className={
                          Number(r.reported_is_blocked) === 1
                            ? "adminUnblockBtn"
                            : "adminBlockBtn"
                        }
                        onClick={() =>
                          toggleBlockUser(
                            r.reported_id,
                            Number(r.reported_is_blocked) === 1,
                          )
                        }
                      >
                        {Number(r.reported_is_blocked) === 1
                          ? "Unblock Seller"
                          : "Block Seller"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
