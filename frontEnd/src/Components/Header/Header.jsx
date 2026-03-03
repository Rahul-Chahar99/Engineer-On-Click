import { Container } from "../index.components";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { logOutUser, reset } from "../../Features/userSlice";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const themes = ["light", "dark", "cupcake","luxury","black"];

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.querySelector("html").setAttribute("data-theme", theme);
  }, [theme]);

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
    
    
  ];

  return (
    <header className="py-2 sm:py-3 shadow bg-base-100 border-b border-base-300">
      <Container>
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="mr-2 sm:mr-4 shrink-0">
            <Link to="/">
              <div className="text-lg sm:text-xl font-bold text-primary">
                Logo
              </div>
            </Link>
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-base-200 transition-all"
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
                    className="px-2 lg:px-3 py-2 text-sm lg:text-base text-base-content hover:text-primary font-medium transition duration-200"
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
                  className="px-2 lg:px-3 py-2 text-sm lg:text-base text-base-content hover:text-red-600 font-medium transition duration-200"
                >
                  Log Out
                </button>
              </li>
            )}
            {authStatus && (
              <li>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-2 lg:px-3 py-2 text-sm lg:text-base text-base-content hover:text-red-600 font-medium transition duration-200"
                >
                  My Profile
                </button>
              </li>
            )}
            <li>
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="px-2 lg:px-3 py-2 text-sm lg:text-base text-base-content hover:text-primary font-medium transition duration-200 flex items-center gap-1">
                  Theme
                </div>
                <ul tabIndex={0} className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52">
                  {themes.map((t) => (
                    <li key={t}>
                      <button onClick={() => setTheme(t)} className={theme === t ? "active" : ""}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <ul className="mt-3 pb-3 space-y-2 border-t border-base-300">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-primary font-medium transition"
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
                  className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-red-600 font-medium transition"
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
                  className="w-full text-left px-4 py-2 text-sm text-base-content hover:bg-base-200 hover:text-red-600 font-medium transition"
                >
                  Log Out
                </button>
              </li>
            )}
            <li className="border-t border-base-300 pt-2">
              <div className="px-4 py-2 text-sm font-medium text-base-content">Select Theme</div>
              <div className="flex gap-2 px-4 pb-2">
                {themes.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1 text-xs rounded-full border ${theme === t ? "bg-primary text-primary-content" : "bg-base-100 text-base-content border-base-300"}`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </Container>
    </header>
  );
}

export default Header;
