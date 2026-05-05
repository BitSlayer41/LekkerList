import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { actions } from "../../store/Store";

const Cart = () => {
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(actions.getCartProducts());
  }, [dispatch]);

  const handleDeleteCartProduct = (id) => {
    dispatch(actions.deleteProductFromCart(id));
  };

  return (
    <div className="productList">
      <ul>
        {cartProducts &&
          cartProducts.map((product) => {
            <li key={product.id} className="product">
              <img src={product.image} alt={product.title} />
              <div className="productInfo">
                <Link to={`/product/${product.idf}`}>
                  <h3>{product.title}</h3>
                </Link>

                <p className="price">{product.category}</p>
                <p>{product.description}</p>
                <p className="price">R{product.price}</p>

                <button onClick={() => handleDeleteCartProduct(product.id)}>
                  <i className="fa regular fa-trash-can"></i>
                </button>
              </div>
            </li>;
          })}
      </ul>
    </div>
  );
};

export default Cart;
