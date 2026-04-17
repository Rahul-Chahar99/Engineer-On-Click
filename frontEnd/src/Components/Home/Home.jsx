import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../../ReusableComponents/Button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Container from "../Container/Container.jsx";
import { GridLoader } from "react-spinners";
import toast from "react-hot-toast";
 const services = [
    {
      id: 1,
      title: "Switch Configuration",
      description: "Professional switch setup and management services",
      price: "₹500",
      icon: "🔌",
    },
    {
      id: 2,
      title: "Router Configuration",
      description: "Professional router setup and management services",
      price: "₹600",
      icon: "🌐",
    },
    {
      id: 3,
      title: "Laptop Configuration",
      description: "Professional laptop setup and management services",
      price: "₹400",
      icon: "💻",
    },
    {
      id: 4,
      title: "Printer Configuration",
      description: "Professional printer setup and management services",
      price: "₹300",
      icon: "🖨️",
    },
    {
      id: 5,
      title: "Server Room Support",
      description: "Professional server room setup and management services",
      price: "₹1200",
      icon: "🗄️",
    },
    {
      id: 6,
      title: "Support Engineer",
      description:
        "On-site support engineers for all your IT infrastructure needs",
      price: "₹1000/day",
      icon: "✅",
    },
  ];
function Home() {
  console.log("page render");
  
  const [allBookingRequest, setAllBookingRequst] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataSource, setDataSource] = useState("");

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages,setTotalPages]=useState(1);
  const [totalRecords,setTotalRecords]=useState(0);
  const { userInfo } = useSelector((state) => state.auth);
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const limit = 5;

  const isPending = inputValue !== searchQuery;

  const handleChange = (e) => {
    setInputValue(e.target.value);
    if (page !== 1) {
      setPage(1);
    }
  };

  useEffect(() => {
    if (userInfo?.role !== "engineer" || !userInfo?._id) {
      return;
    }

    const getBookings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/v1/engineerHome/bookingRequests/${userInfo._id}?page=${page}&limit=${limit}&search=${searchQuery}`,
        );
        if (response.status !== 200) {
          throw new Error(response.data.message || "Failed to fetch booking requests for engineer");
        }
        const result = response.data.data;
        console.log('result for engineer booking requests:',result);
        
        setAllBookingRequst(result.data);
        setDataSource(result.source);
        setTotalPages(result.totalPages);
        setTotalRecords(result.totalRecords);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Unable to fetch booking requests for engineer";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    getBookings();
    const interval = setInterval(getBookings, 600000);
    return () => clearInterval(interval);
  }, [userInfo?.role, userInfo?._id, page, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(inputValue), 700);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const rejectOrAcceptBookingRequest = async (bookingId, status) => {
    try {
      const response = await axios.patch(
        `/api/v1/engineerHome/rejectOrAcceptBooking-requests/${bookingId}`,
        { status },
      );

      const responseOfEngineer = response.data.data.engineerAssign;

      if (
        response.status === 200 &&
        responseOfEngineer === "Rejected_By_Engineer"
      ) {
        setAllBookingRequst((prevRequests) =>
          prevRequests.filter((prev) => prev._id !== bookingId),
        );
        toast.success("Engineer booking request deleted successfully");
      } else if (response.status === 200 && responseOfEngineer === "Accepted") {
        setAllBookingRequst((prevRequests) =>
          prevRequests.map((prev) =>
            prev._id === bookingId
              ? { ...prev, engineerAssign: "Accepted" }
              : prev,
          ),
        );
        setAcceptedIds((prev) => new Set(prev).add(bookingId));
        toast.success("Booking request accepted successfully");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Server error";
      toast.error(errorMessage);
    }
  };

 

  return userInfo?.role !== "engineer" ? (
    <div className="flex flex-col bg-base-200 w-full">
      {/* Hero Section */}
      <div className="flex items-center justify-center py-12 px-4 bg-neutral text-neutral-content">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Professional Engineer Services
          </h1>
          <p id="para" className="text-xl mb-4">
            Hire experienced engineers on daily basis anywhere in India
          </p>
          <Link to="/signup">
            <Button className="bg-primary text-primary-content px-8 py-3 font-bold hover:bg-primary-focus">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Services Grid */}
      <div className="w-full px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-base-content">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-base-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow flex flex-col border border-base-300"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-base-content">
                  {service.title}
                </h3>
                <p className="text-base-content/70 mb-4">
                  {service.description}
                </p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {service.price}
                  </span>
                </div>
                <Link to="/book-engineer" className="mt-auto">
                  <Button className="w-full bg-primary text-primary-content py-2 font-bold hover:bg-primary-focus">
                    Book Engineer
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-neutral text-neutral-content py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🇮🇳</div>
              <h3 className="text-xl font-bold mb-2">All Over India</h3>
              <p className="text-neutral-content/70">
                Available at any location across India
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-2">Daily Basis</h3>
              <p className="text-neutral-content/70">
                Hire engineers for flexible daily contracts
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="text-xl font-bold mb-2">Expert Team</h3>
              <p className="text-neutral-content/70">
                Experienced professionals in various domains
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Container>
      <div className="w-full py-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-base-content">
              Welcome , {userInfo?.fullName} 👋
            </h1>
            <p className="text-base-content/50 text-sm mt-1">Your assigned booking requests</p>
          </div>

          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by branch name or code…"
              className="input input-bordered w-full bg-white/50 text-black focus:bg-gray-100 transition-all duration-300"
              value={inputValue}
              onChange={handleChange}
            />
            {isPending && (
              <span className="absolute right-3 top-3 loading loading-spinner loading-sm text-primary" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-base-content/50 font-medium">
              {totalRecords} record{totalRecords !== 1 ? "s" : ""}
            </span>
            {dataSource && (
              <span className={`badge ${
                dataSource.toLowerCase() === "redis" ? "badge-success" : "badge-info"
              } text-white px-3 py-3 rounded-full text-sm font-semibold whitespace-nowrap`}>
                ⚡ {dataSource}
              </span>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        {loading && allBookingRequest.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <GridLoader color="#36d7b7" size={15} />
          </div>
        ) : allBookingRequest.length > 0 ? (
          <div className={`space-y-4 transition-opacity duration-200 ${
            isPending || loading ? "opacity-50" : "opacity-100"
          }`}>
            {allBookingRequest.map((request) => {
              const isAccepted = acceptedIds.has(request._id) || request.engineerAssign === "Accepted";
              return (
                <div key={request._id} className="bg-base-100 text-base-content rounded-2xl shadow-md border border-base-300 overflow-hidden">

                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-base-200/60 border-b border-base-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {request.customerId?.fullName?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-base-content leading-tight">{request.customerId?.fullName || "N/A"}</p>
                        <p className="text-xs text-base-content/50">{request.customerId?.email || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge font-semibold px-3 py-2 text-white ${
                        request.engineerAssign === "Accepted" ? "badge-success" :
                        request.engineerAssign === "Rejected_By_Engineer" ? "badge-error" :
                        "badge-info"
                      }`}>
                        🔧 {request.engineerAssign}
                      </span>
                      <span className="badge badge-ghost font-semibold px-3 py-2 text-base-content">
                        {request.totalCostOfBooking?.toLocaleString("en-IN", { style: "currency", currency: "INR" }) || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Customer */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/40">👤 Customer</h3>
                      <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Mobile</p>
                        <p className="font-semibold">{request.customerId?.mobileNo || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Local Contact</p>
                        <p className="font-semibold">{request.localContact || "N/A"}</p>
                      </div>
                    </div>

                    {/* Branch */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/40">🏢 Branch</h3>
                      <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Branch Name</p>
                        <p className="font-semibold">{request.branchName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Branch Code</p>
                        <p className="font-semibold">{request.branchCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Address</p>
                        <p className="font-semibold">{request.address}</p>
                      </div>
                      {request.branchId?.branchLocationGoogleLink && (
                        <a
                          href={request.branchId.branchLocationGoogleLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline font-semibold"
                        >
                          📍 View on Maps
                        </a>
                      )}
                    </div>

                    {/* Schedule */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/40">📅 Schedule</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Start Date</p>
                          <p className="font-semibold">{new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">End Date</p>
                          <p className="font-semibold">{new Date(request.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Start Time</p>
                          <p className="font-semibold">{request.startTime || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">End Time</p>
                          <p className="font-semibold">{request.endTime || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-base-content/50 uppercase tracking-wide mb-1">Requested On</p>
                        <p className="font-semibold">{request.createdAt ? new Date(request.createdAt).toLocaleString() : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="bg-base-200/40 px-6 py-4 border-t border-base-300 flex flex-wrap gap-3 items-center justify-end">
                    <button
                      className="btn btn-error btn-sm rounded-lg text-white font-semibold"
                      onClick={() => rejectOrAcceptBookingRequest(request._id, "rejected")}
                    >
                      ✖ Reject
                    </button>
                    <button
                      className={`btn btn-sm rounded-lg text-white font-semibold ${
                        isAccepted ? "btn-success cursor-not-allowed" : "btn-primary"
                      }`}
                      onClick={() => rejectOrAcceptBookingRequest(request._id, "accepted")}
                      disabled={isAccepted}
                    >
                      {isAccepted ? "✅ Accepted" : "✔ Accept"}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 bg-base-100 rounded-2xl shadow border border-base-300 gap-3">
            <span className="text-5xl">📋</span>
            <p className="text-base-content/50 text-lg font-semibold">No booking requests found</p>
            {inputValue && <p className="text-base-content/30 text-sm">Try a different search term</p>}
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-base-content/50 font-medium">
            Total: <span className="font-bold text-base-content">{totalRecords}</span> records
          </p>
          <div className="join">
            <button className="join-item btn btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              « Prev
            </button>
            <button className="join-item btn btn-sm pointer-events-none">
              {page} / {totalPages}
            </button>
            <button className="join-item btn btn-sm" disabled={page >= totalPages || totalPages === 0} onClick={() => setPage(page + 1)}>
              Next »
            </button>
          </div>
        </div>

      </div>
    </Container>
  );
}

export default Home;
