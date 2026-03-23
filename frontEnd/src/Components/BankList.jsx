import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/api/v1/users/bankList?page=${page}&limit=${limit}`,
        );

        // Using the custom ApiResponse structure from the backend
        const result = response.data.data;

        setBanks(result.data);
        console.log("result.data", result.data);

        setTotalPages(result.totalPages);
        console.log("result.totalpage:", result.totalPages);

        setTotalRecords(result.totalRecords);
        console.log("result.totalRecords:", result.totalRecords);
        setDataSource(result.source);
        console.log("result.source:", result.source);
      } catch (error) {
        console.error("Error fetching bank list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, [page]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Bank Branches List</h2>
        {dataSource && (
          <span
            className={`badge ${dataSource === "Redis" ? "badge-success" : "badge-info"} text-white px-3 py-3 rounded-full text-sm font-semibold`}
          >
            Served from: {dataSource}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ScaleLoader color="#36d7b7" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 shadow-xl rounded-lg">
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
              {banks.map((bank) => (
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
              ))}
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
