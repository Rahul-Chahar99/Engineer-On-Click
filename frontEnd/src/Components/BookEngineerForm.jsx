import React from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from '../ReusableComponents/Input.jsx'
import Button from '../ReusableComponents/Button.jsx'
import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

function BookEngineerForm() {
  const [loading ,setLoading] = useState(false)
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);


  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const bookEngineerHandler = async (data) => {
    setLoading(true)
    const customerId = userInfo?._id;
    
    if (!customerId) {
      toast.error("User information not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/v1/book-engineer', {
        ...data,
        customerId
      });
      toast.success(response.data?.message || "Engineer Booked Successfully");
      reset()
      navigate('/')
  
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went Wrong!")
      
    } finally{
      setLoading(false)
    } 
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 bg-base-100 p-8 rounded-2xl shadow-xl border border-base-300">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
            Book an Engineer
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Fill in the details to schedule a visit.
          </p>
        </div>

        <form onSubmit={handleSubmit(bookEngineerHandler)} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Date"
                  type="date"
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100 cursor-pointer [color-scheme:dark]"
                  {...register("startDate", { required: "Start date is required" })}
                />
                {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <Input
                  label="End Date"
                  type="date"
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100 cursor-pointer [color-scheme:dark]"
                  {...register("endDate", {
                    required: "End date is required",
                    validate: (val) => {
                      if (watch('startDate') && val < watch('startDate')) {
                        return "End date cannot be before start date";
                      }
                    }
                  })}
                />
                {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <Input
              label="Branch Code"
              type="text"
              inputMode="numeric"
              placeholder="Enter Branch Code"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "")
              }}
              {...register("branchCode", {
                required: "Branch Code is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Please enter numbers only"
                }
              })}
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
            />
            {errors.branchCode && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.branchCode.message}
              </p>
            )}

            <Input
              label="Branch Name"
              type="text"
              placeholder="Enter Branch Name"
              {...register("branchName", { required: "Branch Name is required" })}
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
            />
            {errors.branchName && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.branchName.message}
              </p>
            )}

            <Input
              label="Address"
              type="text"
              placeholder="Enter Branch Address"
              {...register("branchAddress", { required: "Branch Address is required" })}
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
            />
            {errors.branchAddress && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.branchAddress.message}
              </p>
            )}

            <Input
              label="Local Contact"
              type="text"
              inputMode="numeric"
              placeholder="Enter Local Contact"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "")
              }}
              {...register("localContact", {
                required: "Local Contact is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Please enter numbers only"
                },
                minLength: {
                  value: 10,
                  message: "Contact number must be at least 10 digits"
                },
                maxLength: {
                  value: 10,
                  message: "Contact number must be 10 digits"
                }
              })}
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
            />
            {errors.localContact && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.localContact.message}
              </p>
            )}

            {/* Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Time (10am - 6:30pm)"
                  type="time"
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100 cursor-pointer [color-scheme:dark]"
                  {...register("startTime", {
                    required: "Start time is required",
                    min: { value: "10:00", message: "Time must be after 10:00 AM" },
                    max: { value: "18:30", message: "Time must be before 6:30 PM" }
                  })}
                />
                {errors.startTime && <p className="text-xs text-red-600 mt-1">{errors.startTime.message}</p>}
              </div>
              <div>
                <Input
                  label="End Time"
                  type="time"
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100 cursor-pointer scheme-dark"
                  {...register("endTime", {
                    required: "End time is required",
                    min: { value: "10:00", message: "Time must be after 10:00 AM" },
                    max: { value: "18:30", message: "Time must be before 6:30 PM" },
                    validate: (val) => {
                      if (watch('startTime') && val <= watch('startTime')) {
                        return "End time must be after start time";
                      }
                    }
                  })}
                />
                {errors.endTime && <p className="text-xs text-red-600 mt-1">{errors.endTime.message}</p>}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-lg hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {loading ? "Booking..." : "Book Engineer"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default BookEngineerForm;
