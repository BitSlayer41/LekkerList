import * as api from "../api";
import {
  FETCH_ALL_PRODUCTS,
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
} from "../constants/actionTypes.js";

// GET All
export const getProducts = () => async (dispatch) => {
  try {
    const { data } = await api.fetchProducts();
    console.log("raw response: ", data);
    console.log("products array: ", data.data.products);
    console.log("first product: ", data.data.products?.[0]);

    dispatch({
      type: FETCH_ALL_PRODUCTS,
      payload: data.data.products,
    });
  } catch (err) {
    console.log(err.message);
  }
};

// CREATE
export const createProduct = (productData) => async (dispatch) => {
  try {
    console.log(
      "productData sent to API: ",
      JSON.stringify(productData, null, 2),
    );

    const { data } = await api.createProduct(productData);
    console.log("API response: ", data);

    dispatch({
      type: CREATE_PRODUCT,
      payload: data,
    });
  } catch (err) {
    console.log("error: ", err.response?.data || err.message);
  }
};

// UPDATE
export const updateProduct = (id, product) => async (dispatch) => {
  try {
    const { data } = await api.updateProduct(id, product);

    dispatch({
      type: UPDATE_PRODUCT,
      payload: data.data.product,
    });
  } catch (err) {
    console.log(err.message || err.response?.data);
  }
};

// DELETE
export const deleteProduct = (id) => async (dispatch) => {
  try {
    await api.deleteProduct(id);

    dispatch({
      type: DELETE_PRODUCT,
      payload: id,
    });
  } catch (err) {
    console.log(err.message);
  }
};
