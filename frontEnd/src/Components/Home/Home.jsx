import React from "react";
import Button from "../../ReusableComponents/Button";
import { Link } from "react-router-dom";

function Home() {
  const services = [
    {
      id: 1,
      title: "Web Development",
      description: "Professional web development services for your business",
      price: "₹5,000/day",
      icon: "💻",
    },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Custom mobile applications for iOS and Android",
      price: "₹6,000/day",
      icon: "📱",
    },
    {
      id: 3,
      title: "UI/UX Design",
      description: "Beautiful and user-friendly interface design",
      price: "₹4,500/day",
      icon: "🎨",
    },
    {
      id: 4,
      title: "Cloud Infrastructure",
      description: "AWS, GCP, and Azure deployment solutions",
      price: "₹7,000/day",
      icon: "☁️",
    },
    {
      id: 5,
      title: "Database Management",
      description: "Database design and optimization services",
      price: "₹5,500/day",
      icon: "🗄️",
    },
    {
      id: 6,
      title: "Quality Assurance",
      description: "Comprehensive testing and quality assurance",
      price: "₹4,000/day",
      icon: "✅",
    },
  ];

  return (
    <div className="flex flex-col bg-base-200 w-full">
      {/* Hero Section */}
      <div className="flex items-center justify-center py-12 px-4 bg-neutral text-neutral-content">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Professional Engineer Services
          </h1>
          <p className="text-xl mb-4">
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
                <p className="text-base-content/70 mb-4">{service.description}</p>
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
  );
}

export default Home;
