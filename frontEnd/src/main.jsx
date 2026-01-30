import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import store from "./Features/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import Home from "./Components/Home/Home.jsx";
import Login from "./Components/Login.jsx";
import Singup from "./Components/Singup.jsx";
import App from "./App.jsx";
import AuthLayout from "./Components/AuthLayout.jsx";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <AuthLayout authentication={false}>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout authentication={false}>
              <Singup />
            </AuthLayout>
          }
        />
      </Route>
    </>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
