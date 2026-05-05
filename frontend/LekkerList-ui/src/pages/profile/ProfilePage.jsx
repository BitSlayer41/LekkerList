import { useState } from "react";
import { useSelector } from "react-redux";
import ViewMode from "./ViewMode";
import EditMode from "./EditMode";
import ProfileWithAvatar from "./ProfileWithAvatar";
import "./Profile.css";

export default function ProfilePage({ profile, onSave }) {
  const [isEditing, setIsEditing] = useState(false);

  const authData = useSelector((state) => state.authentication?.authData);
  const authFallback = (() => {
    try {
      return JSON.parse(localStorage.getItem("profile"));
    } catch {
      return null;
    }
  })();

  const userInfo = (authData ?? authFallback)?.user;

  const mergedProfile = profile
    ? {
        ...profile,
        firstname: userInfo?.firstname ?? profile.firstname,
        lastname: userInfo?.lastname ?? profile.lastname,
        email: userInfo?.email ?? profile.email,
        role: userInfo?.role ?? profile.role,
      }
    : null;

  const displayName = mergedProfile
    ? `${mergedProfile.firstname} ${mergedProfile.lastname}`.trim()
    : null;

  return (
    <div className="profilePage">
      <h1>Profile</h1>
      {displayName && <p className="profileWelcome">Welcome, {displayName}</p>}

      <ProfileWithAvatar profile={mergedProfile} />

      {!mergedProfile ? (
        <div>Loading profile...</div>
      ) : isEditing ? (
        <EditMode
          profile={mergedProfile}
          setProfile={onSave}
          setIsEditing={setIsEditing}
        />
      ) : (
        <ViewMode profile={mergedProfile} setIsEditing={setIsEditing} />
      )}
    </div>
  );
}
