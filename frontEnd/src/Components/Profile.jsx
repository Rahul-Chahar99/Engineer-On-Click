import React from "react";
import { useSelector } from "react-redux";

function Profile() {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 min-h-screen p-4 sm:p-6 md:p-8 flex justify-center items-center">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="md:flex ">
          {/* Left Column */}
          <div className="md:w-1/3 bg-gray-50 p-6 md:p-8 border-r border-gray-200">
            <div className="text-center">
              <img
                className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg"
                src={userInfo.avatar || "https://via.placeholder.com/150"}
                alt={userInfo.fullName}
              />
              <h1 className="text-2xl font-bold text-gray-800 mt-4">{userInfo.fullName}</h1>
              <p className="text-sm text-gray-500">@{userInfo.username}</p>
              <p className="text-md text-gray-600 mt-2">{userInfo.jobTitle || "Job title not specified"}</p>
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Social Media</h2>
              <div className="flex justify-center gap-4">
                {userInfo.socialMedia?.linkedIn && (
                  <a href={userInfo.socialMedia.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">LinkedIn</a>
                )}
                {userInfo.socialMedia?.twitter && (
                  <a href={userInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">Twitter</a>
                )}
                {userInfo.socialMedia?.github && (
                  <a href={userInfo.socialMedia.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-900">GitHub</a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:w-2/3 p-6 md:p-8">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800">User Information</h2>
            </div>
            <div>
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-600">Email Address</h3>
                <p className="text-gray-800">{userInfo.email}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-600">Mobile Number</h3>
                <p className="text-gray-800">{userInfo.mobileNo || "Not provided"}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-600">Aadhar Number</h3>
                <p className="text-gray-800">{userInfo.aadharNo || "Not provided"}</p>
              </div>
              <div className="mb-4">
                <h3 className="text-md font-semibold text-gray-600">Address</h3>
                <p className="text-gray-800">{userInfo.address || "Not provided"}</p>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-600">Biography</h3>
                <p className="text-gray-800 mt-1">
                  {userInfo.bio || "No biography available. The user can add a bio to their profile."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
