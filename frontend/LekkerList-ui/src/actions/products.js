import * as api from "../api";
import {
  FETCH_ALL_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from "../constants/actionTypes.js";

// GET all products
export const getProducts = () => async (dispatch) => {
  try {
    const { data } = await api.fetchProducts();
    dispatch({
      type: FETCH_ALL_PRODUCTS,
      payload: data.data.products,
    });
  } catch (err) {
    console.error("getProducts error:", err.message);
  }
};

// CREATE product
export const createProduct = (productData) => async (dispatch) => {
  try {
    const { data } = await api.createProduct(productData);
    dispatch({
      type: CREATE_PRODUCT,
      payload: data,
    });
  } catch (err) {
    console.error("createProduct error:", err.response?.data || err.message);
  }
};

// UPDATE product
export const updateProduct = (id, product) => async (dispatch) => {
  try {
    const { data } = await api.updateProduct(id, product);
    dispatch({
      type: UPDATE_PRODUCT,
      payload: data.data.product,
    });
  } catch (err) {
    console.error("updateProduct error:", err.message || err.response?.data);
  }
};

//DELETE product
export const deleteProduct = (id, requestingId) => async (dispatch) => {
  try {
    await api.deleteProduct(id, requestingId);
    dispatch({
      type: DELETE_PRODUCT,
      payload: id,
    });
  } catch (err) {
    console.error("deleteProduct error:", err.message);
  }
};
