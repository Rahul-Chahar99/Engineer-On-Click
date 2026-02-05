import React from "react";
import { useForm } from "react-hook-form";
import Input from "../ReusableComponents/Input";
import Button from "../ReusableComponents/Button";
import { useDispatch, useSelector } from "react-redux";
import { logInUser, reset } from "../Features/userSlice.js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'



function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth,
  );
  useEffect(() => {
    if (isError) {
      console.log(message);
      
      const errorMessage = typeof message === "object" ? message?.message : message;
      toast.error(errorMessage || "Login failed");
      dispatch(reset());
    }
    if (isSuccess) {
      const successMessage = typeof message === "object" ? message?.message : message;
      toast.success(successMessage || "Login successful");
      dispatch(reset());
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
    
    
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Log in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onLogInSubmit)}>
          <div className="space-y-5">
            <Input
              label="Email or Username"
              type="text"
              placeholder="you@example.com or username"
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm transition duration-200 ease-in-out"
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
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-black sm:text-sm transition duration-200 ease-in-out"
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
            className="flex w-full justify-center rounded-lg bg-black px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
          />
        </form>
        
      </div>
    </div>
  );
}

export default Login;
