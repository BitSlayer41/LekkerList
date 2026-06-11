import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { LOGOUT } from "../../constants/actionTypes";

const SESSION_KEY = "lekkerlist_session_alive";

export default function useSessionGuard() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Mark this tab as alive in sessionStorage
    sessionStorage.setItem(SESSION_KEY, "1");

    const handleBeforeUnload = () => {};

    const handlePageHide = (e) => {
      if (!e.persisted) {
        //Tab/window is closing — log the user out
        localStorage.removeItem("profile");
        localStorage.setItem("cart", "[]");
        dispatch({ type: LOGOUT });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [dispatch]);
}
