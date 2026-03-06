import React from "react";
import axios from "./axios.js"; // Use configured axios instance
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "../ReusableComponents/Input.jsx";
import Button from "../ReusableComponents/Button.jsx";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useEffect } from "react";

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

function BookEngineerForm() {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const branchCodeValue = watch("branchCode");
  const pincodeValue = watch("pincode");

  // Separate useEffect for branch code
  useEffect(() => {
    if (!branchCodeValue) return;

    const delayDeBounce = setTimeout(async () => {
      try {
        const response = await axios.post(`/api/v1/branches/search`, {
          branchCode: branchCodeValue,
        });
        if (response.status === 200) {
          setValue("branchName", response.data?.data?.branchName || "");
          setValue("branchAddress", response.data?.data?.branchAddress || "");
        }
      } catch (error) {
        console.error("Failed to fetch branch details");
      }
    }, 1000);

    return () => clearTimeout(delayDeBounce);
  }, [branchCodeValue, setValue]);

  // Separate useEffect for pincode
  useEffect(() => {
    if (!pincodeValue || pincodeValue.length < 6) {
      setCities([]);
      return;
    }

    const delayDeBounce = setTimeout(async () => {
      try {
        // Create axios instance without credentials for external API
        const response = await axios.get(
          `https://api.postalpincode.in/pincode/${pincodeValue}`,
          { withCredentials: false },
        );
        // console.log("Pincode API response:", response.data);

        if (response.data[0]?.Status === "Success") {
          // console.log("data of response",response.data[0]);
          const postOffices = response.data[0]?.PostOffice || [];
          // console.log("Post Offices found:", postOffices);
          const uniqueCities = [
            ...new Set(postOffices.map((office) => office.District)),
          ];
          const allcities = postOffices.map(
            (name) => name.Name + "," + uniqueCities,
          );
          // console.log('total cities',allcities);

          setCities(allcities);
          // console.log("Cities found:", uniqueCities);
        } else {
          setCities([]);
        }
      } catch (error) {
        console.log("Failed to Fetch pincodes", error);
        setCities([]);
      }
    }, 1000);

    return () => clearTimeout(delayDeBounce);
  }, [pincodeValue]);

  const bookEngineerHandler = async (data) => {
    setLoading(true);
    const customerId = userInfo?._id;

    if (!customerId) {
      toast.error("User information not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      // Load Razorpay SDK
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js",
      );

      if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      // Create the booking/order on the server
      let response;
      try {
        response = await axios.post("/api/v1/book-engineer", {
          ...data,
          customerId,
        });
      } catch (err) {
        console.error("order creation failed", err.response || err);
        toast.error(err.response?.data?.message || "Booking failed");
        setLoading(false);
        return;
      }

      const responseData = response.data;
      const order = responseData.order || responseData.data?.order;
      const key = responseData.key || responseData.data?.key;

      // Check if the backend returned Razorpay order details
      if (order) {
        const { amount, id: order_id, currency } = order;

        const options = {
          key: key || "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard
          amount: amount,
          currency: currency,
          name: "Engineer On Click", // Your business name
          description: "Engineer Booking Transaction",
          // image: "https://example.com/your_logo",
          order_id: order_id,
          config: {
            display: {
              blocks: {
                banks: {
                  name: "Pay using UPI",
                  instruments: [
                    {
                      method: "upi"
                    }
                  ]
                }
              },
              sequence: ["block.banks"],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          handler: async function (response) {
            const paymentData = {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };
            console.log("payment callback data", paymentData);

            try {
              const verifyRes = await axios.post(
                "/api/v1/paymentverification",
                paymentData,
              );
              toast.success(verifyRes.data.message || "Payment Successful");
              reset();
              navigate("/");
            } catch (error) {
              console.error("verification error", error.response || error);
              toast.error(
                error.response?.data?.message || "Payment Verification Failed",
              );
            }
          },
          prefill: {
            name: userInfo?.fullName || "",
            email: userInfo?.email || "example@example.com",
            // Clean the contact number to ensure it only contains digits.
            // Razorpay requires a valid number for UPI.
            contact: (data.localContact || userInfo?.mobileNo || "").replace(
              /\D/g,
              "",
            ),
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              toast("Payment cancelled");
            },
          },
          notes: {
            address: data.branchAddress,
          },
          theme: {
            color: "#3399cc",
          },
        };

        console.log("opening razorpay checkout with options", options);
        try {
          const rzp1 = new window.Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            console.error("razorpay payment failed", response);
            toast.error(response.error.description || "Payment Failed");
          });
          rzp1.open();
        } catch (err) {
          console.error("error initializing Razorpay", err);
          toast.error("Unable to open payment gateway");
        }
      } else {
        // Fallback if no payment details are returned (standard booking)
        toast.success(response.data?.message || "Engineer Booked Successfully");
        reset();
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went Wrong!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

        <form
          onSubmit={handleSubmit(bookEngineerHandler)}
          className="mt-8 space-y-6"
        >
          <div className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-base-content block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-base-content block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  {...register("endDate", {
                    required: "End date is required",
                    validate: (val) => {
                      if (watch("startDate") && val < watch("startDate")) {
                        return "End date cannot be before start date";
                      }
                    },
                  })}
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100"
                />
                {errors.endDate && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <Input
              label="Branch Code"
              type="text"
              inputMode="numeric"
              placeholder="Enter Branch Code"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              {...register("branchCode", {
                required: "Branch Code is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Please enter numbers only",
                },
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
              {...register("branchName", {
                required: "Branch Name is required",
              })}
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
            />
            {errors.branchName && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.branchName.message}
              </p>
            )}

            <Input
              label="Pincode"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit Pincode"
              maxLength="6"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              {...register("pincode", {
                required: "Pincode is required",
                minLength: {
                  value: 6,
                  message: "Pincode must be 6 digits",
                },
                maxLength: {
                  value: 6,
                  message: "Pincode must be 6 digits",
                },
              })}
              className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
            />
            {errors.pincode && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.pincode.message}
              </p>
            )}

            <div>
              <label className="text-sm font-medium text-base-content block mb-1">
                City / City Area
              </label>
              <select
                {...register("city", {
                  required: "City is required",
                })}
                className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
              >
                <option value="">
                  {cities.length > 0 ? "Select City" : "Enter pincode first"}
                </option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-xs text-red-600 font-medium">
                  {errors.city.message}
                </p>
              )}
            </div>

            <Input
              label="Address"
              type="text"
              placeholder="Enter Branch Address"
              {...register("branchAddress", {
                required: "Branch Address is required",
              })}
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
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
              {...register("localContact", {
                required: "Local Contact is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Please enter numbers only",
                },
                minLength: {
                  value: 10,
                  message: "Contact number must be at least 10 digits",
                },
                maxLength: {
                  value: 10,
                  message: "Contact number must be 10 digits",
                },
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
                <label className="text-sm font-medium text-base-content block mb-1">
                  Start Time (10 AM - 6:30 PM)
                </label>
                <select
                  {...register("startTime", {
                    required: "Start time is required",
                  })}
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100"
                >
                  <option value="">Select Start Time</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="12:30 PM">12:30 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="1:30 PM">1:30 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="2:30 PM">2:30 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="3:30 PM">3:30 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="4:30 PM">4:30 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="5:30 PM">5:30 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                </select>
                {errors.startTime && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-base-content block mb-1">
                  End Time
                </label>
                <select
                  {...register("endTime", {
                    required: "End time is required",
                  })}
                  className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content focus:border-primary focus:ring-1 focus:ring-primary bg-base-100"
                >
                  <option value="">Select End Time</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="12:30 PM">12:30 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="1:30 PM">1:30 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="2:30 PM">2:30 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="3:30 PM">3:30 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="4:30 PM">4:30 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="5:30 PM">5:30 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                  <option value="6:30 PM">6:30 PM</option>
                </select>
                {errors.endTime && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.endTime.message}
                  </p>
                )}
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
