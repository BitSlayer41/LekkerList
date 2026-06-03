export default function ProfileWithAvatar({ profile }) {
  if (!profile) return null;

  return (
    <div className="profileWithAvatar">
      <div className="avatarSection">
        {profile.image ? (
          <img
            src={`http://localhost/LekkerList/backend/${profile.image}`}
            alt="Profile"
            className="avatar"
          />
        ) : (
          <div className="avatarPlaceholder">
            {profile.firstname?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
    </div>
  );
}
