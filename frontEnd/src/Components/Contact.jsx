import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Input from "../ReusableComponents/Input";
import Button from "../ReusableComponents/Button";
import axios from "axios";
import toast from "react-hot-toast";

function Contact() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const contactFormHandler = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/v1/contact", data);
      // alert(response.data.message || "Form submitted successfully");
      toast.success(response.data.message?.message || "Form submitted successfully");
      reset();
      navigate("/")
      // console.log(data);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      // alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex items-center justify-center w-full min-h-screen" style={{ backgroundColor: "hsl(255.65deg 10.5% 42.94%)" }}>
      <div className="mx-auto w-full max-w-lg bg-base-100 shadow-xl rounded-xl p-10 border border-base-300 flex flex-col justify-center">
        <h2 className="text-center text-2xl font-bold leading-tight text-base-content">
          Contact Us
        </h2>
        <p className="mt-2 text-center text-base text-base-content/60">
          We&apos;d love to hear from you!
        </p>
        <form onSubmit={handleSubmit(contactFormHandler)} className="mt-8 space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="Enter Your Name"
            {...register("fullName", { required: true })}
            className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
          />
          <Input
            label="Email"
            type="email"
            placeholder="Enter Your Email"
            {...register("email", { required: true })}
            className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
          />
          <Input
            label="Mobile No"
            type="number"
            placeholder="Enter Your Number"
            {...register("phoneNumber", { required: true })}
            className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
          />
          <Input
            label="Your Message"
            type="text"
            placeholder="Enter Your Message"
            {...register("message", { required: true })}
            className="block w-full rounded-lg border border-base-300 px-3 py-2 text-sm text-base-content placeholder-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary transition bg-base-100"
          />
          <Button
            type="submit"
             className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-content shadow hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition mt-3"
            children={loading ? "Sending..." : "Submit"}
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
}

export default Contact;
