const productReducer = (state = [], action) => {
  switch (action.type) {
    case "FETCH_ALL_PRODUCTS":
      return action.payload;
    case "CREATE_PRODUCT":
      return [...state, action.payload];
    case "UPDATE_PRODUCT":
      return state.map((product) =>
        product._id === action.payload._id ? action.payload : product,
      );
    case "DELETE_PRODUCT":
      return state.filter((product) => product._id !== action.payload);
    default:
      return state;
  }
};

export default productReducer;
