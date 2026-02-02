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
      const toastMsg = typeof message ==='object' ? message?.message :message;
      toast.error(toastMsg || "Something went wrong") //replace with a toast notification in a real app
      dispatch(reset());
    }
    if (isSuccess) {
      const toastMsg = typeof message ==='object' ? message?.message :message;
      toast.success(toastMsg || "Account created successfully")
      navigate("/login"); //redirect to login page
      dispatch(reset());
    }
  }, [isError, isSuccess, isLoading, navigate, dispatch]);

  const onSubmit = (data) => {
    console.log("Form submitted with data:", data);
    //create a forData object beacuase we are sending files (multiplart/form-data)
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);

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
    <div className="flex items-center justify-center py-8 bg-gray-800 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-xs text-gray-500 mt-1">Join us to start your journey</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="space-y-3">
          <div className="space-y-2">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition"
              {...register("fullName", { required: true })}
            />
            {errors.fullName && (
              <p className="text-xs text-red-600">Full Name is required</p>
            )}

            <Input
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition"
              {...register("email", {
                required: true,
                validate: {
                  matchPattern: (value) => {
                    return (
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                      "Email address must be a valid address"
                    );
                  },
                },
              })}
            />
            {errors.email && <p className="text-xs text-red-600">Email is required</p>}

            <Input
              label="Username"
              placeholder="Choose a username"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition"
              {...register("username", { required: true })}
            />
            {errors.username && (
              <p className="text-xs text-red-600">Username is required</p>
            )}

            <Input
              label="Password"
              placeholder="Create a password"
              type="password"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:ring-1 focus:ring-black transition"
              {...register("password", { required: true })}
            />
            {errors.password && (
              <p className="text-xs text-red-600">Password is required</p>
            )}

            <Input
              label="Avatar"
              type="file"
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition cursor-pointer"
              {...register("avatar", { required: true })}
            />
            {errors.avatar && <p className="text-xs text-red-600">Avatar is required</p>}

            <Input
              label="Cover Image"
              type="file"
              className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition cursor-pointer"
              {...register("coverImage")}
            />
          </div>

          <Button
            children={isLoading ? "registering..." : "Signup"}
            type="submit"
            className="w-full rounded-lg bg-black px-3 py-2 text-sm font-bold text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition mt-3"
          />
        </form>
      </div>
    </div>
  );
}

export default Singup;
