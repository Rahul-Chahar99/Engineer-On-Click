import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <section className="relative overflow-hidden py-10 bg-base-100 border-t border-base-300">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full p-6 lg:w-3/12"></div>
          <div className="w-full p-6 lg:w-3/12">
            <div className="h-full">
              <h3 className="tracking-px mb-9 text-xs font-semibold uppercase text-base-content/60">
                Company
              </h3>
              <ul>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Features
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Pricing
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Affiliate Program
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/about"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full p-6 lg:w-3/12">
            <div className="h-full">
              <h3 className="tracking-px mb-9 text-xs font-semibold uppercase text-base-content/60">
                Support
              </h3>
              <ul>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Account
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Help
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/contact"
                  >
                    Contact US
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Customer Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full p-6 lg:w-3/12">
            <div className="h-full">
              <h3 className="tracking-px mb-9 text-xs font-semibold uppercase text-base-content/60">
                Legal
              </h3>
              <ul>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Terms & Conditions
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className="text-base font-medium text-base-content hover:text-primary"
                    to="/"
                  >
                    Licensing
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-base-300 pt-6 mt-6">
          <p className="text-sm text-base-content/70 text-center">
            &copy; Copyright 2025. All Rights Reserved by Rahul Chahar.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Footer;
