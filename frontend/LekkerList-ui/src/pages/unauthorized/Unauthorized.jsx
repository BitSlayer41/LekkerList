import { useNavigate } from "react-router-dom";
import "./Unauthorized.css";

import LockIcon from "../../images/lock.svg?react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="unauthorizedPage">
      <div className="unauthorizedCard">
        {/* Icon */}
        <div className="unauthorizedIcon">
          <LockIcon />
        </div>

        {/* Error Code */}
        <div className="unauthorizedCode">403</div>

        {/* Title */}
        <div className="unauthorizedTitle">Unauthorized Access</div>

        {/* Message */}
        <div className="unauthorizedText">
          You do not have permission to access this page.
        </div>

        {/* Actions */}
        <div className="unauthorizedActions">
          <button
            className="unauthorizedBtn unauthorizedBtnPrimary"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>

          <button
            className="unauthorizedBtn unauthorizedBtnSecondary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
