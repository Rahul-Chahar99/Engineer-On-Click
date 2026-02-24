import React from "react";
import Input from "../ReusableComponents/Input";
import Button from "../ReusableComponents/Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useState } from "react";

function UpdatePassword() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    reset,
    watch, // To watch the value of newPassword for validation
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const newPassword = watch("newPassword", ""); // Watch the newPassword field

  const passwordChangeHandler = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/v1/users/update-password", // Corrected endpoint to match common routing patterns and Profile.jsx link
        data,
        { _skipAuthRefresh: true }, // Add this to prevent the global interceptor from logging out on 401s for this specific request
      );
      if (response.status === 200) {
        // console.log(response.data);

        toast.success(
          response.data?.message || "Password updated successfully",
        );
        reset(); // Clear form fields
        navigate("/profile"); // Redirect to profile after successful update
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error(
          "Password update endpoint not found. Please contact support.",
        );
      }
      if (error.response?.status === 401) {
        toast.error(
          error.response?.data?.message ||
            "Unauthorized. Please check your old password.",
        );
      }
      console.error("Password update error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-base-100 p-8 rounded-2xl shadow-xl border border-base-300">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
            Update Password
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Please enter your old and new password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(passwordChangeHandler)}
        >
          <div className="space-y-5">
            <Input
              label="Old Password"
              type="password"
              placeholder="Enter your old password"
              className="block w-full rounded-lg border border-base-300 px-4 py-3 text-base-content placeholder-base-content/50 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out bg-base-100"
              {...register("oldPassword", {
                required: "Old password is required",
              })}
            />
            {errors.oldPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.oldPassword.message}
              </p>
            )}

            <Input
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              className="block w-full rounded-lg border border-base-300 px-4 py-3 text-base-content placeholder-base-content/50 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out bg-base-100"
              {...register("newPassword", {
                required: "New password is required",
              })}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.newPassword.message}
              </p>
            )}

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              className="block w-full rounded-lg border border-base-300 px-4 py-3 text-base-content placeholder-base-content/50 focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out bg-base-100"
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            children={loading ? "Updating..." : "Update"}
            className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
