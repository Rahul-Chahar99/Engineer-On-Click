import React, { useEffect, useState } from "react";
import Container from "./Container/Container.jsx";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "../ReusableComponents/Button.jsx";
import Input from "../ReusableComponents/Input.jsx";
import { ScaleLoader } from "react-spinners";
import { useDeferredValue } from "react";
function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataSource, setDataSource] = useState("");
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const defferedQuery = useDeferredValue(searchTerm);

  const isPending = searchTerm !== defferedQuery;

  const limit = 5;
  const handleChange=(e)=>{
    setSearchTerm(e.target.value)
    setPage(1)
  }

  useEffect(() => {
    const getCustomers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/v1/admin-dashboard/customers?page=${page}&limit=${limit}&search=${defferedQuery}`,
        );
      
        if (response.status === 200) {
          const result = response.data.data || response.data;
          setCustomers(result.data);
          setTotalPages(result.totalPages);
          setTotalRecords(result.totalRecords);
          setDataSource(result.source);
         
        }
      } catch (error) {
        // toast.error("Unable to fetch customers");
      } finally {
        setLoading(false);
      }
    };
    getCustomers();
    const interval = setInterval(getCustomers, 60000);
    return () => clearInterval(interval);
  }, [page, defferedQuery]);

 
  const deleteCustomer = async (customerId) => {
      try {
        const response = await axios.delete(
          `/api/v1/admin-dashboard/customers/${customerId}`,
        );
        if (response.status === 200) {
          setCustomers((prevCusotmer) =>
            prevCusotmer.filter((cust) => cust._id !== customerId),
          );
          setTotalRecords((prev) => prev - 1);
          toast.success("Customer Deleted Successfully");
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setCustomers((prevCusotmer) =>
            prevCusotmer.filter((cust) => cust._id !== customerId),
          );
          setTotalRecords((prev) => prev - 1);
          toast.success("Customer already removed");
        } else {
          toast.error("Failed to delete Customer");
        }
      }
    };

  return  (
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
                All Customers
              </h1>
            </div>
  
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                placeholder="Search by Email"
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
  
          {loading && customers.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <ScaleLoader color="#36d7b7" />
            </div>
          ) : (
            <div className={`space-y-4 transition-opacity duration-200 ${isPending || loading ? "opacity-50" : "opacity-100"}`}>
              {customers && customers.length > 0 ? (
                customers.map((customer) => (
                <div
                  key={customer._id}
                  className="bg-base-100 text-base-content rounded-lg shadow-lg p-6 border border-base-300"
                >
                  <h2>Full Name: {customer.fullName}</h2>
                  <p>Email : {customer.email}</p>
                  <p>Contact No : {customer.mobileNo || "Not Available"}</p>
                  
                 
                  <p className="text-sm text-base-content/70 mt-2">
                    <strong>Account Created:</strong>{" "}
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleString()
                      : "Date not available"}
                  </p>
                  <Button
                    children="Delete Customer"
                    bgColor="bg-error hover:bg-error/80 text-error-content"
                    className="mt-3 rounded-lg cursor-pointer px-4 py-2 text-white font-semibold"
                    onClick={() => deleteCustomer(customer._id)}
                  />
                </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-64 bg-base-100 rounded-lg shadow-xl border border-base-300">
                  <p className="text-base-content/50 text-lg font-semibold">
                    No customers found matching "{defferedQuery}"
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

export default Customers;
