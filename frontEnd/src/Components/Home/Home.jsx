import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Button from "../../ReusableComponents/Button";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Container from "../Container/Container.jsx";
import Input from "../../ReusableComponents/Input.jsx";
import { GridLoader } from "react-spinners";
function Home() {
  console.log("page rendered");
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);
  // console.log('user info:',userInfo);
  const [allBookingRequest, setAllBookingRequst] = useState([]);
  const [filteredBookingRequest, setFilteredBookingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getBookings = async () => {
      try {
        const response = await axios.get(
          `api/v1/engineerHome/bookingRequests/${userInfo._id}`,
        );
        console.log("respone of bookings", response.data.data);

        if (response.status === 200) {
          setAllBookingRequst(response.data?.data || response.data);
          setFilteredBookingRequests(response.data?.data || response.data);
          setLoading(false);
        }
      } catch (error) {}
    };
    if (userInfo?.role === "engineer") {
      getBookings();
    }
  }, [userInfo]);

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

  return userInfo.role !== "engineer" ? (
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
    <div>
      <Container>
        <div className="w-full py-8">
          <h1 className="text-3xl font-bold text-base-content mb-6">
            Welcome {userInfo.fullName} 😊
          </h1>
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
          ) : filteredBookingRequest && filteredBookingRequest.length > 0 ? (
            <div className="space-y-4">
              {filteredBookingRequest.map((request) => (
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
                        <p className="text-sm text-base-content/60">
                          Start Date
                        </p>
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
                        <p className="text-sm text-base-content/60">
                          Start Time
                        </p>
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
                      
                      
                      <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                        <p className="text-sm text-base-content/60">Address</p>
                        <p className="font-semibold">{request.address}</p>
                      </div>
                      <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                        <p className="text-sm text-base-content/60">Google Link</p>
                        <p className="font-semibold">{request.branchId?.branchLocationGoogleLink}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-base-content/60">
                          Total Cost
                        </p>
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
    </div>
  );
}

export default Home;
