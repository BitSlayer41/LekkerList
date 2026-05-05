import { createStore, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import { persistReducer, persistStore } from "redux-persist";
import reducers from "../reducers/index.js";
import { AUTHENTICATION } from "../constants/actionTypes.js";

const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authentication"],
};

const persistedReducer = persistReducer(persistConfig, reducers);

const store = createStore(persistedReducer, compose(applyMiddleware(thunk)));

const persistor = persistStore(store);

const params = new URLSearchParams(window.location.search);
const authParam = params.get("auth");

if (authParam) {
  try {
    const parsed = JSON.parse(atob(authParam));
    console.log("store.js parsed auth: ", parsed);
    if (parsed?.user) {
      localStorage.setItem("profile", JSON.stringify(parsed));
      store.dispatch({ type: AUTHENTICATION, data: parsed });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (err) {
    console.error("store.js auth parse failed: ", err);
  }
}

export { store, persistor };
