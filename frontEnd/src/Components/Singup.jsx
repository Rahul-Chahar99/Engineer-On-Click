import React from "react";
import { useEffect } from "react";
import Input from "../ReusableComponents/Input";
import Button from "../ReusableComponents/Button";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { userRegister, reset } from "../Features/userSlice";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function Singup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isError) {
      // console.log(message?.[0].message);
      
      toast.error(message || "Something went wrong"); //replace with a toast notification in a real app
      dispatch(reset());
    }
    if (isSuccess) {
      toast.success(message || "Account created successfully");
      navigate("/login"); //redirect to login page
      dispatch(reset());
    }
  }, [isError, isSuccess, isLoading, navigate, dispatch]);

  const onSubmit = (data) => {
    // console.log("Form submitted with data:", data);
    //create a forData object beacuase we are sending files (multiplart/form-data)
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("role", data.role);

    // to check formData contents
    // console.log("FormData contents:", {
    //   fullName: formData.get("fullName"),
    //   email: formData.get("email"),
    //   username: formData.get("username"),
    //   password: formData.get("password"),
    // });

    if (data.avatar && data.avatar.length > 0) {
      formData.append("avatar", data.avatar[0]);
    }
    if (data.coverImage && data.coverImage.length > 0) {
      formData.append("coverImage", data.coverImage[0]);
    }
    dispatch(userRegister(formData));
  };

  return (
    <div className="flex items-center justify-center py-8 bg-base-200 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-base-100 p-6 rounded-xl shadow-lg border border-base-300">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-base-content">
            Create Account
          </h2>
          <p className="text-xs text-base-content/60 mt-1">
            Join us to start your journey
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
          className="space-y-3"
        >
          <div className="space-y-2">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
              {...register("fullName", { required: true })}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600">Full Name is required</p>
            )}

            <Input
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
              {...register("email", {
                required: true,
                validate: {
                  matchPattern: (value) => {
                    return (
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                        value,
                      ) || "Email address must be a valid address"
                    );
                  },
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-600">Email is required</p>
            )}

            <Input
              label="Username"
              placeholder="Choose a username"
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
              {...register("username", { required: true })}
            />
            {errors.username && (
              <p className="text-xs text-red-600">Username is required</p>
            )}

            <Input
              label="Password"
              placeholder="Create a password"
              type="password"
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <p className="text-xs text-red-600">Password is required</p>
            )}

            <div className="flex items-center space-x-4 py-2">
              <span className="text-sm text-base-content font-medium">
                Register as:
              </span>
              <div className="flex items-center">
                <input
                  id="engineer"
                  type="radio"
                  value="engineer"
                  className="radio radio-primary radio-sm"
                  {...register("role", { required: "Please select a role" })}
                />
                <label
                  htmlFor="engineer"
                  className="ml-2 text-sm text-base-content cursor-pointer"
                >
                  Engineer
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="customer"
                  type="radio"
                  value="customer"
                  className="radio radio-primary radio-sm"
                  {...register("role", { required: "Please select a role" })}
                />
                <label
                  htmlFor="customer"
                  className="ml-2 text-sm text-base-content cursor-pointer"
                >
                  Customer
                </label>
              </div>
            </div>
            {errors.role && (
              <p className="text-xs text-red-600">{errors.role.message}</p>
            )}
          </div>

          <Button
            children={isLoading ? "registering..." : "Signup"}
            type="submit"
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-content shadow hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition mt-3"
          />
        </form>
      </div>
    </div>
  );
}

export default Singup;
