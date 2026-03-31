import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Container from "./Container/Container";
import Button from "../ReusableComponents/Button";
import Input from "../ReusableComponents/Input.jsx";
import { GridLoader } from "react-spinners";
import { useDeferredValue } from "react";

function EngineerRequests() {
  const [engineerRequests, setEngineerRequests] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const [loading, setLoading] = useState(true);
  const [availableEngineers, setAvailableEngineers] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState("");
  const [dataSource, setDataSource] = useState("");
  const deferredSearchQuery = useDeferredValue(inputValue);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 3;

  const [page, setPage] = useState(1);

  // 3. We know React is processing if these two don't match
  const isPending = inputValue !== deferredSearchQuery;

  const handleChange = (e) => {
    setInputValue(e.target.value);
    setPage(1);
  };

  const deleteBookingRequest = async (bookingId) => {
    try {
      const response = await axios.delete(
        `/api/v1/admin-dashboard/booking-requests/${bookingId}`,
      );
      if (response.status === 200) {
        setEngineerRequests((prevRequests) =>
          prevRequests.filter((prev) => prev._id !== bookingId),
        );
        toast.success("Engineer Booking  Form Deleted Successfully");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete booking request";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const getEngineerRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/v1/admin-dashboard/booking-requests?page=${page}&limit=${limit}&search=${deferredSearchQuery}`,
        );
        if (response.status !== 200) {
          throw new Error(
            response.data.message || "Failed to fetch engineer requests",
          );
        }
        const result = response.data.data;

        // const finalrespone = result.data.filter(
        //   (request) => request.paymentStatus !== "Pending",
        // );
        console.log(result.data);
        setEngineerRequests(result.data);
        setDataSource(result.source);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Unable to fetch engineer requests";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    getEngineerRequests();
    const interval = setInterval(getEngineerRequests, 60000); // auto refresh every 60 seconds

    // Cleanup interval on unmount or before next effect runs
    return () => clearInterval(interval);
  }, [page, deferredSearchQuery]);

  const showAvailableEngineer = async (orderId) => {
    try {
      const response = await axios.get(
        `/api/v1/admin-dashboard/available-engineers/${orderId}`,
      );
      // console.log("engineer data ",response.data.data);
      if (response.status === 200) {
        setAvailableEngineers(response.data.data);
        setActiveOrderId(orderId);
        setSelectedEngineerId(""); // Reset selection
        // console.log("Available Engineers Name are ", response.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch available engineers");
    }
  };

  const assignEngineerHandler = async () => {
    if (!selectedEngineerId) {
      toast.error("Please select an engineer first");
      return;
    }
    console.log("engineer id ", selectedEngineerId);

    try {
      const response = await axios.patch(
        "/api/v1/admin-dashboard/assign-engineer",
        {
          orderId: activeOrderId,
          engineerId: selectedEngineerId,
        },
      );

      if (response.status === 200) {
        toast.success("Engineer Assigned Successfully");
        setActiveOrderId(null);
        // Refresh the list or update local state to reflect change
        window.location.reload();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign engineer");
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
              Booking Requests
            </h1>
          </div>

          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by Branch, Customer, Code..."
              className="input input-bordered w-full"
              value={inputValue}
              onChange={handleChange}
            />
            {isPending && (
              <span className="absolute right-3 top-3 loading loading-spinner loading-sm text-primary"></span>
            )}
          </div>
          {dataSource && (
            <span
              className={`badge ${
                dataSource === "Redis" ? "badge-success" : "badge-info"
              } text-white px-3 py-3 rounded-full text-sm font-semibold`}
            >
              Served from: {dataSource}
            </span>
          )}
        </div>

        {loading && engineerRequests.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <GridLoader color="#36d7b7" size={30} />
          </div>
        ) : engineerRequests && engineerRequests.length > 0 ? (
          <div
            className={`overflow-x-auto bg-base-100 shadow-xl rounded-lg transition-opacity duration-200 ${
              isPending || loading ? "opacity-50" : "opacity-100"
            }`}
          >
            <table className="table w-full">
              <thead className="bg-base-200">
                <tr>
                  <th>Customer</th>
                  <th>Branch</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {engineerRequests.map((request) => (
                  <React.Fragment key={request._id}>
                    <tr className="hover">
                      <td>
                        <div className="font-semibold">
                          {request.customerId?.fullName || "N/A"}
                        </div>
                        <div className="text-sm opacity-70">
                          {request.customerId?.email || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{request.branchName}</div>
                        <div className="text-sm opacity-70">
                          Code: {request.branchCode}
                        </div>
                      </td>
                      <td>
                        {new Date(request.startDate).toLocaleDateString()} -{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        <div
                          className={`badge ${
                            request.paymentStatus === "Completed"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {request.paymentStatus}
                        </div>
                        <div className="text-sm opacity-70 mt-1">
                          {request.engineerAssign}
                        </div>
                      </td>
                      <td>
                        {request.assignedEngineerId?.fullName || (
                          <span className="text-xs italic opacity-70">
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="text-center space-x-2 whitespace-nowrap">
                        <Button
                          children="Assign"
                          className="btn btn-sm btn-outline btn-primary p-2"
                          onClick={() => showAvailableEngineer(request.orderId)}
                          disabled={request.engineerAssign === "Assigned"}
                        />
                        <Button
                          children="Delete"
                          className="btn btn-sm btn-error text-white p-2 mt-2"
                          onClick={() => deleteBookingRequest(request._id)}
                        />
                      </td>
                    </tr>
                    {activeOrderId === request.orderId && (
                      <tr className="bg-base-200">
                        <td colSpan="6">
                          <div className="p-4 animate-in fade-in slide-in-from-top-3">
                            {availableEngineers.length > 0 ? (
                              <div className="form-control w-full">
                                <label className="label">
                                  <span className="label-text font-semibold">
                                    Select Engineer to Assign:
                                  </span>
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedEngineerId || "default"}
                                    onChange={(e) =>
                                      setSelectedEngineerId(e.target.value)
                                    }
                                  >
                                    <option value="default" disabled>
                                      Pick an engineer
                                    </option>
                                    {availableEngineers.map((eng) => (
                                      <option key={eng._id} value={eng._id}>
                                        {eng.fullName} (
                                        {eng.username || "Engineer"})
                                      </option>
                                    ))}
                                  </select>
                                  <Button
                                    children="Confirm Assign"
                                    className="btn btn-primary whitespace-nowrap"
                                    onClick={assignEngineerHandler}
                                  />
                                </div>
                              </div>
                            ) : (
                              <p className="text-error text-sm mt-2 font-semibold">
                                No available engineers found for this request's
                                location.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-base-content/50 text-lg">
              No booking requests found matching "{deferredSearchQuery}"
            </p>
          </div>
        )}
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-500">Total Records: {totalRecords}</p>
          <div className="join">
            <button
              className="join-item btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              « Prev
            </button>
            <button className="join-item btn">
              Page {page} of {totalPages}
            </button>
            <button
              className="join-item btn"
              disabled={page === totalPages || totalPages === 0}
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

export default EngineerRequests;
