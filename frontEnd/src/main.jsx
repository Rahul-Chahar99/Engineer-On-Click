import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import axios from "axios";

// Configure axios for production
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true;

import store from "./Features/store";
import { Provider } from "react-redux";
import App from "./App.jsx";
import AuthLayout from "./Components/AuthLayout.jsx";

const Home = lazy(() => import("./Components/Home/Home.jsx"));
const Login = lazy(() => import("./Components/Login.jsx"));
const Singup = lazy(() => import("./Components/Singup.jsx"));
const Profile = lazy(() => import("./Components/Profile.jsx"));
const Admin_DashBoard = lazy(() => import("./Components/Admin_DashBoard.jsx"));
const Customers = lazy(() => import("./Components/Customers.jsx"));
const Contact = lazy(() => import("./Components/Contact.jsx"));
const ContactForms = lazy(() => import("./Components/ContactForms.jsx"));
const Enginners = lazy(() => import("./Components/Enginners.jsx"));
const About = lazy(() => import("./Components/About.jsx"));
const UpdatePassword = lazy(() => import("./Components/UpdatePassword.jsx"));
const BookEngineerForm = lazy(
  () => import("./Components/BookEngineerForm.jsx"),
);

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
          path="/book-engineer"
          element={
            <AuthLayout authentication>
              <BookEngineerForm />
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
