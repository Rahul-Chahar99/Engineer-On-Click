import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import axios from "axios";

// Global configuration: Ensure cookies (containing tokens) are sent with every request
axios.defaults.withCredentials = true;

import store from "./Features/store";
import { Provider } from "react-redux";
import Home from "./Components/Home/Home.jsx";
import Login from "./Components/Login.jsx";
import Singup from "./Components/Singup.jsx";
import App from "./App.jsx";
import AuthLayout from "./Components/AuthLayout.jsx";
import Profile from "./Components/Profile.jsx";
import Admin_DashBoard from "./Components/Admin_DashBoard.jsx";
import Customers from "./Components/Customers.jsx";
import Contact from "./Components/Contact.jsx";
import ContactForms from "./Components/ContactForms.jsx";
import Enginners from "./Components/Enginners.jsx";
import About from "./Components/About.jsx";
import UpdatePassword from "./Components/UpdatePassword.jsx";
import GenerateImageAuto from './Components/GenerateImageAuto.jsx'
import BookEngineerForm from "./Components/BookEngineerForm.jsx";

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
        <Route path="/about" element={<About />} />
        <Route
          path="/login"
          element={
            // authentication={false} means only unauthenticated users can see this (redirects if logged in)
            <AuthLayout authentication={false}>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            // authentication={false} means only unauthenticated users can see this
            <AuthLayout authentication={false}>
              <Singup />
            </AuthLayout>
          }
        />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/profile"
          element={
            // authentication={true} (default) means this route is protected; requires login
            <AuthLayout authentication>
              <Profile />
            </AuthLayout>
          }
        />
        <Route
          path="/profile/update-password"
          element={
            <AuthLayout authentication>
              <UpdatePassword />
            </AuthLayout>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <AuthLayout authentication>
              <Admin_DashBoard />
            </AuthLayout>
          }
        />
        <Route
          path="/admin-dashboard/contact-forms"
          element={
            <AuthLayout authentication>
              <ContactForms />
            </AuthLayout>
          }
        />
        <Route
          path="/admin-dashboard/engineers"
          element={
            <AuthLayout authentication>
              <Enginners />
            </AuthLayout>
          }
        />
        <Route
          path="/admin-dashboard/customers"
          element={
            <AuthLayout authentication>
              <Customers />
            </AuthLayout>
          }
        />
        <Route
        path='/book-engineer'
        element={
          <AuthLayout authentication>
              <BookEngineerForm/> 
          </AuthLayout>
        }

        />
        <Route
        path="/generate-ai-image"
        element={
          <AuthLayout authentication>
            <GenerateImageAuto/>
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
