import React from "react";
import { useState, useEffect } from "react";
import { Container } from "./index.components.js";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "../ReusableComponents/Button.jsx";

function Enginners() {
  const [loading, setLoading] = useState(false);
  const [engineers, setEngineer] = useState([]);

  const deleteEngineer = async (engineerId) => {
    try {
      const response = await axios.delete(
        `/api/v1/admin-dashboard/engineer/${engineerId}`,
      );
      if (response.status === 200) {
        setEngineer((prevEngineers) =>
          prevEngineers.filter(
            (prevEngineer) => prevEngineer._id !== engineerId,
          ),
        );
        toast.success("Engineer Deleted Successfully");
      }
    } catch (error) {
      toast.error("Failed to delete engineer");
    }
  };

  useEffect(() => {
    const getEnginners = async () => {
      try {
        const response = await axios.get("/api/v1/admin-dashboard/engineers");
        if (response.status === 200) {
          const allEngineers = response.data.data || response.data;
          setEngineer(allEngineers);
          //toast.success("Enginners fetched successfully");
        }
      } catch (error) {
        //toast.error("Unable to fetch engineers");
        console.log(`Unable to fetch Enginners : ${error.message}`);
        
      }
      finally{
        setLoading(false)
      }
    };
    getEnginners()
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center py-12">
          <p className="text-lg">Loading Engineers...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="w-full py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Engineer</h1>
        {engineers && engineers.length > 0 ? (
          <div className="space-y-4">
            {engineers.map((engineer, index) => (
              <div
                key={engineer._id || index}
                className="bg-gray-800 text-white rounded-lg shadow-lg p-6"
              >
                <h2>Full Name: {engineer.fullName}</h2>
                <p>Email : {engineer.email}</p>
                <p>Contact No : {engineer.phoneNumber || "Not Available"}</p>
                <p>Aadhar No : {engineer.aadharNo || "Not Available"}</p>
                <p>Job Title : {engineer.jobTitle || "Not Available"}</p>
                <p className="text-sm text-gray-300 mt-2">
                  <strong>Account Created:</strong>{" "}
                  {engineer.createdAt
                    ? new Date(engineer.createdAt).toLocaleString()
                    : "Date not available"}
                </p>
                <Button
                  children="Delete Engineer"
                  bgColor="bg-red-600 hover:bg-red-700"
                  className="mt-3 rounded-lg cursor-pointer px-4 py-2 text-white font-semibold"
                  onClick={() => deleteEngineer(engineer._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No Engineer Available</p>
        )}
      </div>
    </Container>
  );
}

export default Enginners;
