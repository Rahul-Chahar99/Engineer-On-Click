import React from "react";
import { useState, useEffect, useRef } from "react";
import Button from "../ReusableComponents/Button.jsx";
import { useSelector } from "react-redux";
import Input from "../ReusableComponents/Input.jsx";
import axios from "axios";
import toast from "react-hot-toast";

function Profile() {
  const { userInfo } = useSelector((state) => state.auth);
  const [edit, setEdit] = useState(false);
  const [formData, setFormData] = useState({});
  const avatarRef = useRef(null);
  const coverImageRef = useRef(null);

  useEffect(() => {
    if (userInfo) {
      setFormData({
        ...userInfo,
        socialMedia:
          userInfo.socialMedia && !Array.isArray(userInfo.socialMedia)
            ? userInfo.socialMedia
            : { linkedIn: "", twitter: "", github: "" },
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [name]: value },
    }));
  };
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, avatar: file }));
  };
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, coverImage: file }));
  };
  const updateProfile = async () => {
    // Client-side validation based on the Mongoose schema
    if (formData.mobileNo && formData.mobileNo.length !== 10) {
      return toast.error("Mobile number must be exactly 10 digits.");
    }

    if (formData.aadharNo && formData.aadharNo.length !== 12) {
      return toast.error("Aadhar number must be exactly 12 digits.");
    }

    const data = new FormData();
    for (const key in formData) {
      if (key === "socialMedia") {
        if (formData.socialMedia) {
          for (const socialKey in formData.socialMedia) {
            data.append(
              `socialMedia[${socialKey}]`,
              formData.socialMedia[socialKey],
            );
          }
        }
      } else if (key === "avatar" || key === "coverImage") {
        if (formData[key] instanceof File) {
          data.append(key, formData[key]);
        }
      } else {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
    }

    try {
      console.log("Updating profile with data:", formData);
      const response = await axios.put("/api/v1/users/update-profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(response.data?.message || "Profile updated successfully");
      setEdit(false);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error("Update error:", error);
    }
  };

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 min-h-screen p-4 flex justify-center items-center">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Cover Image Section */}
        <div className="relative w-full h-48 bg-gray-300 group">
          <img
            src={
              formData.coverImage instanceof File
                ? URL.createObjectURL(formData.coverImage)
                : formData.coverImage || "https://via.placeholder.com/800x200"
            }
            alt="Cover"
            className="w-full h-full object-cover-center"
          />
          {edit && (
            <div
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => coverImageRef.current.click()}
            >
              <span className="text-white font-semibold">Change Cover</span>
            </div>
          )}
          <input
            type="file"
            ref={coverImageRef}
            className="hidden"
            onChange={handleCoverImageChange}
            accept="image/*"
          />
        </div>

        <div className="md:flex ">
          {/* Left Column */}
          <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center border-r border-gray-200">
            <div className="text-center -mt-20 relative">
              <div className="relative inline-block group">
                <img
                  className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg object-cover bg-white"
                  src={
                    formData.avatar instanceof File
                      ? URL.createObjectURL(formData.avatar)
                      : formData.avatar || "https://via.placeholder.com/150"
                  }
                  alt={formData.fullName}
                />
                {edit && (
                  <div
                    className="absolute inset-0 rounded-full bg-black bg-opacity-30 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => avatarRef.current.click()}
                  >
                    <span className="text-white text-xs font-semibold">
                      Change
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={avatarRef}
                className="hidden"
                onChange={handleAvatarChange}
                accept="image/*"
              />
              <h1 className="text-2xl font-bold text-gray-800 mt-4">
                {formData.fullName || userInfo.fullName}
              </h1>
              <p className="text-sm text-gray-500">
                @{formData.username || userInfo.username}
              </p>
              <p className="text-md text-gray-600 mt-2">
                {formData.jobTitle ||
                  userInfo.jobTitle ||
                  "Job title not specified"}
              </p>
            </div>
            <div className="mt-6 w-full text-center">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Connect
              </h2>
              <div className="flex justify-center gap-4">
                {userInfo.socialMedia?.linkedIn && (
                  <a
                    href={userInfo.socialMedia.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                )}
                {userInfo.socialMedia?.twitter && (
                  <a
                    href={userInfo.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-700 transition-colors"
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {userInfo.socialMedia?.github && (
                  <a
                    href={userInfo.socialMedia.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:text-black transition-colors"
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0122 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Profile Details
              </h2>
              <div className="w-fit">
                <Button
                  type="button"
                  bgColor="bg-gray-700 hover:bg-gray-900"
                  className="px-4! py-2! flex items-center gap-2 cursor-pointer text-white font-semibold rounded-lg"
                  onClick={() => (edit ? updateProfile() : setEdit(true))}
                >
                  {edit ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      Save
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Full Name
                </label>
                <Input
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "border-transparent! bg-transparent! px-0!"}`}
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Email
                </label>
                <Input
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "border-transparent! bg-transparent! px-0!"}`}
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Mobile Number
                </label>
                <Input
                  name="mobileNo"
                  value={formData.mobileNo || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  maxLength="10"
                  className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "border-transparent! bg-transparent! px-0!"}`}
                  placeholder={edit ? "Enter mobile number" : "Not provided"}
                />
              </div>
              <div className="col-span-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Aadhar Number
                </label>
                <Input
                  name="aadharNo"
                  value={formData.aadharNo || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  maxLength="12"
                  className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "border-transparent! bg-transparent! px-0!"}`}
                  placeholder={edit ? "Enter Aadhar number" : "Not provided"}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Job Title
                </label>
                <Input
                  name="jobTitle"
                  value={formData.jobTitle || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "border-transparent! bg-transparent! px-0!"}`}
                  placeholder={edit ? "Enter Job Title" : "Not provided"}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Address
                </label>
                <Input
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  disabled={!edit}
                  className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "border-transparent! bg-transparent! px-0!"}`}
                  placeholder={edit ? "Enter address" : "Not provided"}
                />
              </div>
              {edit && (
                <div className="col-span-1 md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Social Media Links
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      name="linkedIn"
                      value={formData.socialMedia?.linkedIn || ""}
                      onChange={handleSocialChange}
                      disabled={!edit}
                      placeholder="LinkedIn URL"
                      className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "!borer-transparen!t bg-transparent! px-0!"}`}
                    />
                    <Input
                      name="twitter"
                      value={formData.socialMedia?.twitter || ""}
                      onChange={handleSocialChange}
                      disabled={!edit}
                      placeholder="Twitter URL"
                      className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "!borer-transparen!t bg-transparent! px-0!"}`}
                    />
                    <Input
                      name="github"
                      value={formData.socialMedia?.github || ""}
                      onChange={handleSocialChange}
                      disabled={!edit}
                      placeholder="GitHub URL"
                      className={`w-full p-2 rounded border ${edit ? "border-gray-300 bg-white" : "!borer-transparen!t bg-transparent! px-0!"}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
