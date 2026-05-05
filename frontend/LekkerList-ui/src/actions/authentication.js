import * as api from "../api";
import { AUTHENTICATION } from "../constants/actionTypes";

const signup = (formValues, navigate) => async (dispatch) => {
  try {
    const { data } = await api.signup(formValues);
    dispatch({
      type: AUTHENTICATION,
      data: data,
    });
    navigate("/");
  } catch (err) {
    console.log(err);
  }
};

const login = (formValues, navigate) => async (dispatch) => {
  try {
    const { data } = await api.login(formValues);
    dispatch({
      type: AUTHENTICATION,
      data: data,
    });
    navigate("/");
  } catch (err) {
    console.log(err);
  }
};

export { signup, login };
