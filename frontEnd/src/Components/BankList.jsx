import React, { useState, useEffect, useDeferredValue } from "react";
import api from "./axios";
import { ScaleLoader } from "react-spinners";

const BankList = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [dataSource, setDataSource] = useState("");
  const limit = 10;

  // 1. Standard immediate state for the input
  const [inputValue, setInputValue] = useState("");

  // 2. React creates the lagging/deferred version automatically
  const deferredSearchQuery = useDeferredValue(inputValue);

  // 3. We know React is processing if these two don't match
  const isPending = inputValue !== deferredSearchQuery;

  // Reset to page 1 whenever the user types something new
  const handleSearchChange = (e) => {
    setInputValue(e.target.value);
    setPage(1); 
  };

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        // 4. We pass the deferredSearchQuery to the backend!
        const response = await api.get(
          `/api/v1/users/bankList?page=${page}&limit=${limit}&search=${deferredSearchQuery}`
        );
        console.log("response is :",response.data);
        

        const result = response.data.data;
        setBanks(result.data);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
        setDataSource(result.source);
      } catch (error) {
        console.error("Error fetching bank list:", error);
      } finally {
        setLoading(false);
      }
    };

    // This runs whenever the page changes OR the deferred value updates
    fetchBanks();
    const interval=setInterval(fetchBanks,60000) // auto refresh every 60 seconds

    // Cleanup interval on unmount or before next effect runs
    return () => clearInterval(interval);
  }, [page, deferredSearchQuery]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Bank Branches List</h2>

        {/* Search Box */}
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search Branch Code..."
            className="input input-bordered w-full"
            value={inputValue}
            onChange={handleSearchChange}
          />
          {/* Spinner shows while React defers the search or fetches data */}
          {isPending && (
            <span className="absolute right-3 top-3 loading loading-spinner loading-sm text-primary"></span>
          )}
        </div>

        {dataSource && (
          <span
            className={`badge ${dataSource === "Redis" ? "badge-success" : "badge-info"} text-white px-3 py-3 rounded-full text-sm font-semibold`}
          >
            Served from: {dataSource}
          </span>
        )}
      </div>

      {loading && banks.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <ScaleLoader color="#36d7b7" />
        </div>
      ) : (
        <div className={`overflow-x-auto bg-base-100 shadow-xl rounded-lg transition-opacity duration-200 ${isPending || loading ? "opacity-50" : "opacity-100"}`}>
          <table className="table w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Branch Code</th>
                <th>Branch Name</th>
                <th>Address</th>
                <th>Google Link</th>
              </tr>
            </thead>
            <tbody>
              {banks.length > 0 ? (
                banks.map((bank) => (
                  <tr key={bank._id} className="hover">
                    <td className="font-semibold">{bank.branchCode}</td>
                    <td>{bank.branchName}</td>
                    <td>{bank.branchAddress}</td>
                    <td>
                      {bank.branchLocationGoogleLink ? (
                        <a
                          href={bank.branchLocationGoogleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View Map
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-gray-500 font-semibold">
                    No branches found matching "{deferredSearchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
  );
};

export default BankList;