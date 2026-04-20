import React from "react";
import { useForm } from "react-hook-form";
import Input from "../ReusableComponents/Input";
import Button from "../ReusableComponents/Button";
import { useDispatch, useSelector } from "react-redux";
import { logInUser, reset as resetAuth } from "../Features/userSlice.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1/users/auth/google`;
  };
  useEffect(() => {
    if (isError) {
      // console.log(message);

      const errorMessage =
        typeof message === "object" ? message?.message : message;
      toast.error(errorMessage || "Login failed");
      dispatch(resetAuth());
      // reset();
    }
    if (isSuccess) {
      const successMessage =
        typeof message === "object" ? message?.message : message;
      toast.success(successMessage || "Login successful");
      dispatch(resetAuth());
      navigate("/");
    }
  }, [isError, isLoading, isSuccess, message, navigate, dispatch]);

  const onLogInSubmit = (data) => {
    // determine whether identifier is an email or username
    const identifier = data.identifier?.trim();
    let payload = { password: data.password };
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (emailRegex.test(identifier)) {
      payload.email = identifier;
    } else {
      payload.username = identifier;
    }
    dispatch(logInUser(payload));
    console.log("login button clicked");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-base-100 p-8 rounded-2xl shadow-xl border border-base-300">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
            Log in to your account
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Welcome back! Please enter your details.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onLogInSubmit)}>
          <div className="space-y-5">
            <Input
              label="Email or Username"
              type="text"
              placeholder="you@example.com or username"
              className="block w-full rounded-lg border border-base-300 px-4 py-2 text-base-content placeholder-base-content/50 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out bg-base-100"
              {...register("identifier", {
                required: "Email or username is required",
              })}
            />
            {errors.identifier && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.identifier.message}
              </p>
            )}

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              className="block w-full rounded-lg border border-base-300 px-4 py-2 text-base-content placeholder-base-content/50 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out bg-base-100"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                Password is required
              </p>
            )}
          </div>

          <Button
            children={isLoading ? "Logging In..." : "Log In"}
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
          />
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full justify-center rounded-lg bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 mt-4"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google logo"
              className="h-5 w-5 mr-2"
            />
            Continue with Google
          </Button>
          <p className="text-sm text-base-content/70 text-center">
            ___________________ Or Create An Account ___________________
          </p>
        </form>
        <Button
          children="Create Account"
          onClick={() => navigate("/signup")}
          type="submit"
          className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
        />
      </div>
    </div>
  );
}

export default Login;
