const ROLE_LABELS = {
  admin: "Admin",
  seller: "Seller",
  customer: "Customer",
  guest: "Guest",
};

const ROLE_COLORS = {
  admin: "#e8622a",
  seller: "#2bbfb3",
  customer: "#6b7280",
  guest: "#6b7280",
};

export default function ViewMode({ profile, setIsEditing }) {
  const role = profile.role ?? "guest";

  return (
    <div className="viewMode">
      <div className="profileField">
        <label>First name</label>
        <p>{profile.firstname}</p>
      </div>

      <div className="profileField">
        <label>Last name</label>
        <p>{profile.lastname}</p>
      </div>

      <div className="profileField">
        <label>Email</label>
        <p>{profile.email}</p>
      </div>

      <div className="profileField">
        <label>Role</label>
        <p>
          <span
            style={{
              color: ROLE_COLORS[role],
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          >
            {ROLE_LABELS[role] ?? role}
          </span>
        </p>
      </div>
      <button onClick={() => setIsEditing(true)}>Edit Profile</button>
    </div>
  );
}
