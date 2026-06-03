import { useState } from "react";

export default function EditMode({ profile, setProfile, setIsEditing }) {
  const [formData, setFormData] = useState(profile);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(
    profile.image
      ? `http://localhost/LekkerList/backend/${profile.image}`
      : null,
  );

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("firstname", formData.firstname);
    data.append("lastname", formData.lastname);
    data.append("email", formData.email);
    if (avatar) data.append("avatar", avatar);
    await setProfile(data);
    setIsEditing(false);
  };

  const handleDeleteAvatar = async () => {
    const data = new FormData();
    data.append("deleteAvatar", "true");
    await setProfile(data);
    setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="editMode">
      {/* Avatar preview */}
      <div className="formField">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="avatar"
            style={{ marginBottom: 8 }}
          />
        ) : (
          <div className="avatarPlaceholder">
            {profile.firstname?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      <div className="formField">
        <label>First name</label>
        <input
          name="firstname"
          value={formData.firstname ?? ""}
          onChange={handleChange}
        />
      </div>

      <div className="formField">
        <label>Last name</label>{" "}
        <input
          name="lastname"
          value={formData.lastname ?? ""}
          onChange={handleChange}
        />
      </div>

      <div className="formField">
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={formData.email ?? ""}
          onChange={handleChange}
        />
      </div>

      <div className="formField">
        <label>Profile Image</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      {profile.image && (
        <button type="button" onClick={handleDeleteAvatar}>
          Delete Avatar
        </button>
      )}

      <div className="btnGroup">
        <button type="submit">Save Changes</button>
        <button type="button" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
