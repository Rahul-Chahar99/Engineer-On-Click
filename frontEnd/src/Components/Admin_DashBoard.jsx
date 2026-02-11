import React, { useState, useEffect } from 'react'
import Container from '../Components/Container/Container.jsx'
import { Link, Outlet } from 'react-router-dom'
import Button from '../ReusableComponents/Button.jsx'

function Admin_DashBoard() {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Container>
      <div className="w-full py-8">
        {/* Header with Time */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Admin Dashboard</h1>
            <p className="text-base-content/70 mt-2">
              Welcome to the Admin Dashboard. Here you can manage engineers, customers, and form requests.
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-base-content">{currentTime}</p>
            <p className="text-sm text-base-content/60">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Engineers Card */}
          <div className="bg-base-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-base-300">
            <div className="text-4xl mb-4">👨‍💼</div>
            <h3 className="text-xl font-bold mb-2 text-base-content">Engineers</h3>
            <p className="text-base-content/70 mb-4">Manage and view all registered engineers</p>
            <Link to='/admin-dashboard/engineers'>
              <Button className="w-full bg-primary text-primary-content py-2 font-bold hover:bg-primary-focus">
                See All Engineers
              </Button>
            </Link>
          </div>

          {/* Customers Card */}
          <div className="bg-base-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-base-300">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2 text-base-content">Customers</h3>
            <p className="text-base-content/70 mb-4">View and manage customer information</p>
            <Link to="/admin-dashboard/customers">
              <Button className="w-full bg-primary text-primary-content py-2 font-bold hover:bg-primary-focus">
                See All Customers
              </Button>
            </Link>
          </div>

          {/* Form Requests Card */}
          <div className="bg-base-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-base-300">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2 text-base-content">Contact Forms</h3>
            <p className="text-base-content/70 mb-4">Review and process form submissions</p>
            <Link to="/admin-dashboard/contact-forms">
              <Button className="w-full bg-primary text-primary-content py-2 font-bold hover:bg-primary-focus">
                View Contact-Form Requests
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default Admin_DashBoard
