import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Container from "./Container/Container";
import Button from "../ReusableComponents/Button";
import { GridLoader } from "react-spinners";

function EngineerRequests() {
  const [engineerRequests, setEngineerRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const deleteBookingRequest = async (bookingId) => {
    try {
      const response = await axios.delete(
        `/api/v1/admin-dashboard/booking-requests/${bookingId}`,
      );
      if (response.status === 200) {
        setEngineerRequests((prevRequests) =>
          prevRequests.filter((prev) => prev._id !== bookingId),
        );
        toast.success("Conctact Form Deleted Successfully");
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
        console.log(response.data);
        if (response.status === 200) {
          setEngineerRequests(response.data.data || response.data);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Unable to fetch engineer requests";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    getEngineerRequests();
  }, []);

  return (
    <Container>
      <div className="w-full py-8">
        <h1 className="text-3xl font-bold text-base-content mb-6">
          Engineer Booking Requests
        </h1>
        <Button
          bgColor="bg-neutral text-neutral-content"
          className="rounded-lg mb-6"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>

        {loading ? (
          <div className="flex justify-center items-center py-20 w-full">
            <GridLoader color="#36d7b7" size={30} />
          </div>
        ) : engineerRequests && engineerRequests.length > 0 ? (
          <div className="space-y-4">
            {engineerRequests.map((request) => (
              <div
                key={request._id}
                className="bg-base-100 text-base-content rounded-lg shadow-lg p-6 border border-base-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <p className="text-sm text-base-content/60">Branch Code</p>
                    <p className="font-semibold">{request.branchCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Branch Name</p>
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
                    <p className="font-semibold">{request.endTime || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">
                      Local Contact
                    </p>
                    <p className="font-semibold">{request.localContact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Address</p>
                    <p className="font-semibold">{request.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-base-content/60">Requested On</p>
                    <p className="font-semibold">
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <Button
                    children="Delete Form"
                    bgColor="bg-error hover:bg-error/80 text-error-content"
                    className="mt-3 rounded-lg cursor-pointer px-4 py-2 text-white font-semibold"
                    onClick={() => deleteBookingRequest(request._id)}
                  />
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
