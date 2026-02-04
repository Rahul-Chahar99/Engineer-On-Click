import React, { useEffect, useState } from "react";
import Container from "./Container/Container.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "../ReusableComponents/Button.jsx";
function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const deleteCustomer = async (customerId) => {
    try {
      const response = await axios.delete(
        `/api/v1/admin-dashboard/customers/${customerId}`,
      );
      if (response.status === 200) {
        setCustomers((prevCustomers) =>
          prevCustomers.filter(
            (prevCustomer) => prevCustomer._id !== customerId,
          ),
        );
        toast.success("Customer Deleted SuccessFully");
      }
    } catch (error) {
      toast.error(`Failed To Delete Customer :${error}`);
    }
  };

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const response = await axios.get("/api/v1/admin-dashboard/customers");
        if (response.status === 200) {
          const allCustomers = response.data.data || response.data;
          setCustomers(allCustomers);
        }
      } catch (error) {
        // toast.error("Unable to fetch customers");
      } finally {
        setLoading(false);
      }
    };
    getCustomers();
  }, []);
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading Customers...</p>
      </div>
    );

  return (
    <Container>
      <div className="w-full py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Customer</h1>
        <Button
          bgColor="bg-black text-white"
          className="rounded-lg" // This className will be passed to the underlying button
          onClick={() => window.history.back()} // Corrected: use 'onClick' (camelCase)
        >
          Go Back
        </Button>
        {customers && customers.length > 0 ? (
          <div className="space-y-4">
            {customers.map((customer, index) => (
              <div
                key={customer._id || index}
                className="bg-gray-800 text-white rounded-lg shadow-lg p-6"
              >
                <h2>Company Name : {customer.fullName}</h2>
                <p>Email : {customer.email}</p>
                <p>Contact No : {customer.phoneNumber || "Not Available"}</p>
                <p className="text-sm text-gray-300 mt-2">
                  <strong>Account Created:</strong>{" "}
                  {customer.createdAt
                    ? new Date(customer.createdAt).toLocaleString()
                    : "Date not available"}
                </p>
                <Button
                  children="Delete Customer"
                  bgColor="bg-red-600 hover:bg-red-700"
                  className="mt-3 rounded-lg cursor-pointer px-4 py-2 text-white font-semibold"
                  onClick={() => deleteCustomer(customer._id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 text-lg">No Customer Available</p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default Customers;
