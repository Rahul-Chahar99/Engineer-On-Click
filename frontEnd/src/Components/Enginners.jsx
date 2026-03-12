import React from "react";
import { useState, useEffect } from "react";
import Container from "./Container/Container.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "../ReusableComponents/Button.jsx";
import Input from "../ReusableComponents/Input.jsx";

function Enginners() {
  const [loading, setLoading] = useState(false);
  const [engineers, setEngineer] = useState([]);
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
        setFilteredEngineers((prevFiltered) =>
          prevFiltered.filter((eng) => eng._id !== engineerId)
        );
        toast.success("Engineer Deleted Successfully");
      }
    } catch (error) {
      toast.error("Failed to delete engineer");
    }
  };
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchTerm) {
        setFilteredEngineers(engineers);
        return;
      }
      const lowerCaseTerm = searchTerm.toLowerCase();
      const filtered = engineers.filter(
        (engineer) =>
          engineer.fullName?.toLowerCase().includes(lowerCaseTerm) ||
          engineer.mobileNo?.includes(lowerCaseTerm) ||
          engineer.pincode?.includes(lowerCaseTerm)
      );
      setFilteredEngineers(filtered);
      console.log("page render");
      
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, engineers]);

  useEffect(() => {
    const getEnginners = async () => {
      try {
        const response = await axios.get("/api/v1/admin-dashboard/engineers");
        if (response.status === 200) {
          const allEngineers = response.data.data || response.data;
          setEngineer(allEngineers);
          setFilteredEngineers(allEngineers);
          console.log("Fetched Engineers:", allEngineers);

          //toast.success("Enginners fetched successfully");
        }
      } catch (error) {
        //toast.error("Unable to fetch engineers");
        // console.log(`Unable to fetch Enginners : ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    getEnginners();
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
        <h1 className="text-3xl font-bold text-base-content mb-6">
          All Engineer
        </h1>
        <div className="w-full py-2 flex items-center justify-around">
          <Button
          bgColor="bg-neutral text-neutral-content"
          className="rounded-lg" // This className will be passed to the underlying button
          onClick={() => window.history.back()} // Corrected: use 'onClick' (camelCase)
        >
          Go Back
        </Button>
        <Input
          label="Search Engineers"
          className="mt-4 mb-6 w-lg bg-white/50 px-3 py-2 rounded-lg text-black focus:bg-gray-200 transition-all duration-300"
          placeholder="Search by name, mobile number, or pincode"
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />
        </div>
        {filteredEngineers && filteredEngineers.length > 0 ? (
          <div className="space-y-4">
            {filteredEngineers.map((engineer, index) => (
              <div
                key={engineer._id || index}
                className="bg-base-100 text-base-content rounded-lg shadow-lg p-6 border border-base-300"
              >
                <h2>Full Name: {engineer.fullName}</h2>
                <p>Email : {engineer.email}</p>
                <p>Contact No : {engineer.mobileNo || "Not Available"}</p>
                <p>Aadhar No : {engineer.aadharNo || "Not Available"}</p>
                <p>Job Title : {engineer.jobTitle || "Not Available"}</p>
                <p>Pincode :{engineer.pincode || "Not Available"}</p>
                <p>Status :{engineer.is_active ? "Active" : "Inactive"}</p>
                <p className="text-sm text-base-content/70 mt-2">
                  <strong>Account Created:</strong>{" "}
                  {engineer.createdAt
                    ? new Date(engineer.createdAt).toLocaleString()
                    : "Date not available"}
                </p>
                <Button
                  children="Delete Engineer"
                  bgColor="bg-error hover:bg-error/80 text-error-content"
                  className="mt-3 rounded-lg cursor-pointer px-4 py-2 text-white font-semibold"
                  onClick={() => deleteEngineer(engineer._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-base-content/50 text-lg">
              No Engineer Available
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default Enginners;
