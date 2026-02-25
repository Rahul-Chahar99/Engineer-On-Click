import { Suspense, useEffect, useState } from "react";
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
    // 1. Axios Interceptor: Handle 401s by refreshing token
    const interceptorId = axios.interceptors.response.use(
//       axios.interceptors.response.use: This registers a "listener" that intercepts every HTTP response received by the application.
// (response) => response: The first argument handles successful responses (status 200-299). It simply returns the response as is, doing nothing extra.
// async (error) => { ... }: The second argument handles errors (status 400+). This is where the logic lives.
      (response) => response, // Return successful responses as is
      async (error) => {
        // originalRequest: Saves the configuration (URL, method, data, headers) of the request that just failed. We need this to retry the request later if we successfully refresh the token.
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest._skipAuthRefresh && // Added this check
          originalRequest.url !== "/api/v1/users/refresh-token"
        ) {
          originalRequest._retry = true;
          try {
            await axios.post("/api/v1/users/refresh-token");
            return axios(originalRequest);
          } catch (error) {
            dispatch(logout());
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      },
    );

    // 2. Initial Session Check
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/users/current-user");
        //data: Refers to the variable holding the entire JSON response above.
// .data: Refers to the specific key inside that JSON object where the actual user information lives.
// the second .data from out backend ,Your backend uses a standardized ApiResponse class (seen in user.controller.js). When it sends a response, it looks something like this:

// console.log(data);to check what we got in data

        dispatch(login(data.data));
      } catch (error) {
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, [dispatch]);
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {!loading ? (
        <div className="min-h-screen flex flex-wrap content-between bg-base-200">
          <div className="w-full block">
            <Header />
            <main>
              {/* Wrap Outlet with Suspense to handle lazy-loaded route components */}
              <Suspense fallback={<div className="text-center py-10">Loading Page...</div>}>
                <Outlet />
              </Suspense>
            </main>
            <Footer />
          </div>
        </div>
      ) : (
        // A proper fallback for the initial app load
        <div className="flex justify-center items-center h-screen w-full">Loading Application...</div>
      )}
    </>
  );
}

export default App;
