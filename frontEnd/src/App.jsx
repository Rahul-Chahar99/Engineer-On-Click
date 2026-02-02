import { useEffect, useState } from "react";
import "./App.css";
import { useDispatch } from "react-redux";
import { login, logout } from "./Features/userSlice";
import { Outlet } from "react-router-dom";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";
import axios from "axios";
import { Toaster } from "react-hot-toast";



function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    // Axios Interceptor to handle 401 errors and refresh token
    const interceptor = axios.interceptors.response.use(
      (response) => response, // Return successful responses as is
      async (error) => {
        const originalRequest = error.config;
        // Check if error is 401, we haven't retried yet, and it's not the refresh endpoint itself
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== "/api/v1/users/refresh-token"
        ) {
          originalRequest._retry = true; // Mark request to prevent infinite loops
          try {
            // Attempt to get a new access token using the refresh token (stored in HttpOnly cookie)
            await axios.post("/api/v1/users/refresh-token");
            // Retry the original request with the new session
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails (token expired/invalid), force logout to clear state
            dispatch(logout());
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Initial Session Check:
    // When the app loads/refreshes, verify if the user is still logged in via cookies
    axios
      .get("/api/v1/users/current-user")
      .then((res) => {
        if (res.data) {
          dispatch(login(res.data.data));
        } else {
          dispatch(logout());
        }
      })
      .catch((err) => {
        // console.log(err);
        dispatch(logout());
      })
      .finally(() => setLoading(false)); // Stop loading spinner regardless of success/failure

    return () => {
      // Cleanup: Eject the interceptor to prevent memory leaks or duplicate logic on re-renders
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {!loading ? (
        <div className="min-h-screen flex flex-wrap content-between bg-white">
          <div className="w-full block">
            <Header />
            <main>
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      ) : (
        <div>Loading....</div>
      )}
    </>
  );
}

export default App;
