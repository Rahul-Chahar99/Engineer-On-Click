import { Container } from "../index.components";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logOutUser, reset } from "../../Features/userSlice";
import { useState } from "react";
import toast from "react-hot-toast";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { authStatus, userInfo } = useSelector((state) => state.auth);

  const logOutHandler = async () => {
    await dispatch(logOutUser());
    dispatch(reset());
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const navItems = [
    {
      name: "Home",
      slug: "/",
      active: true,
    },
    {
      name: "About Us",
      slug: "/about",
      active: true,
    },
    {
      name: "Contact Us",
      slug: "/contact",
      active: userInfo?.role === "admin" ? false : true,
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "Admin Dashboard",
      slug: "/admin-dashboard",
      active: authStatus && userInfo?.role === "admin" ? true : false,
    },
    {
      name:"Generate Ai Image",
      slug:"/generate-ai-image",
      active:authStatus
    }
  ];

  return (
    <header className="py-2 sm:py-3 shadow bg-white border-b border-gray-200">
      <Container>
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="mr-2 sm:mr-4 shrink-0">
            <Link to="/">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                Logo
              </div>
            </Link>
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className={`w-6 h-6 transform transition-transform duration-400 ease-in-out ${
                mobileMenuOpen ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex ml-auto space-x-2 lg:space-x-4">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition duration-200"
                    onClick={() => navigate(item.slug)}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null,
            )}
            {authStatus && (
              <li>
                <button
                  onClick={logOutHandler}
                  className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-red-600 font-medium transition duration-200"
                >
                  Log Out
                </button>
              </li>
            )}
            {authStatus && (
              <li>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-red-600 font-medium transition duration-200"
                >
                  My Profile
                </button>
              </li>
            )}
           
          </ul>
        </nav>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <ul className="mt-3 pb-3 space-y-2 border-t border-gray-200">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium transition"
                    onClick={() => {
                      navigate(item.slug);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null,
            )}
            {authStatus && (
              <li>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 font-medium transition"
                >
                  My Profile
                </button>
              </li>
            )}

            {authStatus && (
              <li>
                <button
                  onClick={() => {
                    logOutHandler();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 font-medium transition"
                >
                  Log Out
                </button>
              </li>
            )}
          </ul>
        </div>
      </Container>
    </header>
  );
}

export default Header;
