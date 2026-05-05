const getSession = () => {
  try {
    return JSON.parse(localStorage.getItem("profile"));
  } catch {
    return null;
  }
};

export const getUser = () => {
  return getSession()?.user ?? null;
};

export const getUserId = () => {
  return getUser()?.user ?? null;
};

export const isAdmin = () => {
  return getUser()?.role === "admin";
};
