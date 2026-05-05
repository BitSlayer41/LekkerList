import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AUTHENTICATION } from "../../constants/actionTypes";
import ProfilePage from "./ProfilePage";

export default function ProfilePageWithApi() {
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const authData = useSelector((state) => state.authentication?.authData);
  const userId = authData?.user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId);
  }, [userId]);

  const fetchProfile = async (id) => {
    try {
      const res = await fetch(
        `http://localhost/LekkerList/backend/api/profile.php?id=${id}`,
      );

      const data = await res.json();
      if (!data.success) throw new Error("Failed");
      setProfileState(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (formData) => {
    try {
      formData.append("id", userId);

      const res = await fetch(
        "http://localhost/LekkerList/backend/api/profile.php",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (data.success && data.user) {
        setProfileState(data.user);

        const currentSession = JSON.parse(localStorage.getItem("profile"));
        const updatedSession = {
          ...currentSession,
          user: {
            ...currentSession?.user,
            firstname: data.user.firstname,
            lastname: data.user.lastname,
            email: data.user.email,
            image: data.user.image,
          },
        };

        localStorage.setItem("profile", JSON.stringify(updatedSession));
        dispatch({ type: AUTHENTICATION, data: updatedSession });
      }
    } catch (err) {
      setError(err.message);
    }
  };
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>No profile found!</div>;

  return <ProfilePage profile={profile} onSave={saveProfile} />;
}
