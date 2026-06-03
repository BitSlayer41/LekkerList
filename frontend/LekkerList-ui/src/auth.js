const getSession = () => {
  try {
    const raw = localStorage.getItem("profile");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Invalid session:", err);
    return null;
  }
};

export const getUser = () => {
  return getSession()?.user ?? null;
};

export const getUserId = () => {
  return getUser()?.id ?? null;
};

export const isAdmin = () => {
  return getUser()?.role === "admin";
};
