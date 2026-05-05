import { combineReducers } from "redux";
import productReducer from "./products";
import authentication from "./authentication";

export default combineReducers({
  products: productReducer,
  authentication,
});
