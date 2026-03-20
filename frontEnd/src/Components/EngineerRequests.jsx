import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Container from "./Container/Container";
import Button from "../ReusableComponents/Button";
import { GridLoader } from "react-spinners";
import Input from "../ReusableComponents/Input.jsx";

function EngineerRequests() {
  const [engineerRequests, setEngineerRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEngineerRequests, setFilteredEngineerRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableEngineers, setAvailableEngineers] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState("");

  const deleteBookingRequest = async (bookingId) => {
    try {
      const response = await axios.delete(
        `/api/v1/admin-dashboard/booking-requests/${bookingId}`,
      );
      if (response.status === 200) {
        setEngineerRequests((prevRequests) =>
          prevRequests.filter((prev) => prev._id !== bookingId),
        );
        setFilteredEngineerRequests((prevRequests) =>
          prevRequests.filter((prev) => prev._id !== bookingId),
        );
        toast.success("Engineer Booking  Form Deleted Successfully");
      }
    } catch (error) {
      const errorMessage = response.message || "error 500";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    const getEngineerRequests = async () => {
      try {
        const response = await axios.get(
          "/api/v1/admin-dashboard/booking-requests",
        );
        
        console.log(response.data.data);
        const finalrespone=response.data.data.filter((request)=>request.paymentStatus!=="Pending");
        console.log(finalrespone);
        if (response.status === 200 ) {
          setEngineerRequests(finalrespone);
          setFilteredEngineerRequests(finalrespone);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Unable to fetch engineer requests";
      console.log(errorMessage);
      
      } finally {
        setLoading(false);
      }
    };
    getEngineerRequests();
  }, []);

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
  useEffect(() => {
    const delayBounceFn = setTimeout(() => {
      if (!searchTerm) return setFilteredEngineerRequests(engineerRequests);
      const lowerCaseTerm = searchTerm.toLowerCase();
      const filtered = engineerRequests.filter(
        (request) =>
          request.customerId?.fullName?.toLowerCase().includes(lowerCaseTerm) ||
          request.branchCode?.includes(lowerCaseTerm) ||
          request.branchName?.includes(lowerCaseTerm) && request.paymentStatus!=="Pending"
      );
      setFilteredEngineerRequests(filtered);
    }, 500);
    return () => clearTimeout(delayBounceFn);
  }, [searchTerm, engineerRequests]);

  return (
    <Container>
      <div className="w-full py-8">
        <h1 className="text-3xl font-bold text-base-content mb-6">
          Engineer Booking Requests
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
            label="Search Customers"
            className="mt-4 mb-6 w-lg bg-white/50 px-3 py-2 rounded-lg text-black focus:bg-gray-200 transition-all duration-300"
            placeholder="Search by Branch Name, Customer Name, or Branch Code"
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <GridLoader color="#36d7b7" size={30} />
          </div>
        ) : filteredEngineerRequests && filteredEngineerRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredEngineerRequests.map((request) =>request.paymentStatus==="Pending"? null : (
              <div
                key={request._id}
                className="bg-base-100 text-base-content rounded-lg shadow-lg border border-base-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-base-content/60">
                        Customer Name
                      </p>
                      <p className="font-semibold">
                        {request.customerId?.fullName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Customer Email
                      </p>
                      <p className="font-semibold">
                        {request.customerId?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Customer Mobile
                      </p>
                      <p className="font-semibold">
                        {request.customerId?.mobileNo || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Branch Code
                      </p>
                      <p className="font-semibold">{request.branchCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Branch Name
                      </p>
                      <p className="font-semibold">{request.branchName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">Start Date</p>
                      <p className="font-semibold">
                        {new Date(request.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">End Date</p>
                      <p className="font-semibold">
                        {new Date(request.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">Start Time</p>
                      <p className="font-semibold">
                        {request.startTime || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">End Time</p>
                      <p className="font-semibold">
                        {request.endTime || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Local Contact
                      </p>
                      <p className="font-semibold">{request.localContact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Assigned Engineer Name
                      </p>
                      <p className="font-semibold">
                        {request.assignedEngineerId?.fullName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Assigned Engineer Mobile No
                      </p>
                      <p className="font-semibold">
                        {request.assignedEngineerId?.mobileNo || "N/A"}
                      </p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                      <p className="text-sm text-base-content/60">Address</p>
                      <p className="font-semibold">{request.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Payment Status
                      </p>
                      <p className="font-semibold">{request.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Engineer Assignment
                      </p>
                      <p className="font-semibold">{request.engineerAssign}</p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">Total Cost</p>
                      <p className="font-semibold">
                        {request.totalCostOfBooking?.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-base-content/60">
                        Requested On
                      </p>
                      <p className="font-semibold">
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className="bg-base-200/50 px-6 py-4 border-t border-base-300">
                  <div className="flex flex-wrap gap-3 items-center justify-end">
                    <Button
                      children="Delete Form"
                      bgColor="bg-error hover:bg-error/80 text-error-content"
                      className="w-full sm:w-auto rounded-lg cursor-pointer px-6 py-3 text-white font-semibold"
                      onClick={() => deleteBookingRequest(request._id)}
                    />
                    <Button
                      children="See Available Engineers"
                      className="w-full sm:w-auto cursor-pointer px-6 py-3 text-white font-semibold rounded-lg"
                      onClick={() => showAvailableEngineer(request.orderId)}
                    />
                  </div>

                  {activeOrderId === request.orderId && (
                    <div className="mt-4 p-4 bg-base-100 rounded-lg border border-base-300 animate-in fade-in slide-in-from-top-3">
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
                                  {eng.fullName} ({eng.username || "Engineer"})
                                </option>
                              ))}
                            </select>
                            <Button
                              children="Assign Engineer"
                              className="w-full sm:w-auto cursor-pointer px-6 py-3 text-white font-semibold whitespace-nowrap rounded-lg"
                              onClick={assignEngineerHandler}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-error text-sm mt-2 font-semibold">
                          No engineers found in this area.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-base-content/50 text-lg">
              No Engineer Requests Available
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default EngineerRequests;
