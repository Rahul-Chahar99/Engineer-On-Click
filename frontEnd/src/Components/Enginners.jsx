import React from "react";
import { useState, useEffect } from "react";
import Container from "./Container/Container.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "../ReusableComponents/Button.jsx";
import Input from "../ReusableComponents/Input.jsx";
import { useDeferredValue } from "react";
import { ScaleLoader } from "react-spinners";

function Enginners() {
  const [loading, setLoading] = useState(false);
  const [engineers, setEngineers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataSource, setDataSource] = useState("");
  const defferedQuery = useDeferredValue(searchTerm);
  const limit=5

  const isPending = searchTerm !== defferedQuery;

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  useEffect(() => {
    const getEnginners = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/v1/admin-dashboard/engineers?page=${page}&limit=${limit}&search=${defferedQuery}`,
        );
        if (response.status === 200) {
          const result = response.data.data;
          setEngineers(result.data);
          setTotalPages(result.totalPages);
          setTotalRecords(result.totalRecords);
          setDataSource(result.source);
        }
      } catch (error) {
        console.error("Error fetching engineers list:", error);
      } finally {
        setLoading(false);
      }
    };
    getEnginners();
     const interval=setInterval(getEnginners,60000) // auto refresh every 60 seconds

    // Cleanup interval on unmount or before next effect runs
    return () => clearInterval(interval);
  }, [page, defferedQuery]);

  const deleteEngineer = async (engineerId) => {
    try {
      const response = await axios.delete(
        `/api/v1/admin-dashboard/engineer/${engineerId}`,
      );
      if (response.status === 200) {
        setEngineers((prevEngineers) =>
          prevEngineers.filter((eng) => eng._id !== engineerId),
        );
        setTotalRecords((prev) => prev - 1);
        toast.success("Engineer Deleted Successfully");
      }
    } catch (error) {
      toast.error("Failed to delete engineer");
    }
  };


  return (
    <Container>
      <div className="w-full py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button
              bgColor="bg-neutral text-neutral-content"
              className="rounded-lg whitespace-nowrap"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-base-content whitespace-nowrap">
              All Engineers
            </h1>
          </div>

          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by name, mobile no, or pincode..."
              className="input input-bordered w-full bg-white/50 text-black focus:bg-gray-200 transition-all duration-300"
              value={searchTerm}
              onChange={handleChange}
            />
            {isPending && (
              <span className="absolute right-3 top-3 loading loading-spinner loading-sm text-primary"></span>
            )}
          </div>

          {dataSource && (
            <span
              className={`badge ${dataSource.toLowerCase() === "redis" ? "badge-success" : "badge-info"} text-white px-3 py-3 rounded-full text-sm font-semibold whitespace-nowrap`}
            >
              Served from: {dataSource}
            </span>
          )}
        </div>

        {loading && engineers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <ScaleLoader color="#36d7b7" />
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity duration-200 ${isPending || loading ? "opacity-50" : "opacity-100"}`}>
            {engineers && engineers.length > 0 ? (
              engineers.map((engineer) => (
              <div
                key={engineer._id}
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
              ))
            ) : (
              <div className="flex justify-center items-center h-64 bg-base-100 rounded-lg shadow-xl border border-base-300">
                <p className="text-base-content/50 text-lg font-semibold">
                  No Engineers found matching "{defferedQuery}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500 font-semibold">Total Records: {totalRecords}</p>
          <div className="join">
            <button
              className="join-item btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              « Prev
            </button>
            <button className="join-item btn pointer-events-none">
              Page {page} of {totalPages}
            </button>
            <button
              className="join-item btn"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
            >
              Next »
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Enginners;
