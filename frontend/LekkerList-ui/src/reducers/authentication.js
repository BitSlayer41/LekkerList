import { AUTHENTICATION, LOGOUT } from "../constants/actionTypes";

const storedProfile = localStorage.getItem("profile");

const intialState = {
  authData: storedProfile ? JSON.parse(storedProfile) : null,
};

const authenticationReducer = (state = intialState, action) => {
  switch (action.type) {
    case AUTHENTICATION:
      localStorage.setItem("profile", JSON.stringify(action?.data));
      return {
        ...state,
        authData: action?.data,
      };

    case LOGOUT:
      localStorage.removeItem("profile");
      return {
        ...state,
        authData: null,
      };

    default:
      return state;
  }
};
export default authenticationReducer;
