import React from "react";
import logo from "../assets/imgs/footer-logo.png";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  
  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/admin");

  if (hideFooter) return null;

  return (
    <footer className="bg-slate-900 shadow-md">
      <div className="container mx-auto px-4"></div>

      <div className="bg-slate-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="bg-slate-800 pt-12 pb-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                
                {/* Brand */}
                <div className="lg:col-span-2">
                  <div className="flex items-center mb-6">
                    <img
                      src={logo}
                      className="w-32 md:w-40"
                      alt="Younique Logo"
                    />
                  </div>

                  <p className="text-gray-200 text-sm md:text-base leading-relaxed max-w-2xl">
                    We hand-select the most effective and beloved products—from
                    affordable Indian favorites like Foxtale and Plum to cult
                    K-Beauty essentials and high-end luxury. Find your perfect
                    routine, backed by powerful ingredients, all in one place.
                  </p>
                </div>

              
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-6 pb-2 border-b border-gray-200">
                    Quick Links
                  </h2>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        to="/"
                        className="text-gray-200 hover:text-[#C58B7A]"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/about"
                        className="text-gray-200 hover:text-[#C58B7A]"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/allproducts"
                        className="text-gray-200 hover:text-[#C58B7A]"
                      >
                        All Products
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        className="text-gray-200 hover:text-[#C58B7A]"
                      >
                        Contact Us
                      </Link>
                    </li>
                  </ul>
                </div>

            
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-6 pb-2 border-b border-gray-200">
                    Contact Us
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-100 mb-1">
                        Address
                      </h3>
                      <p className="text-gray-200 text-sm leading-relaxed">
                        Younique, E-commerce Center<br />
                        12/A, Tech Hub Road, Whitefield<br />
                        Bengaluru, Karnataka - 560066<br />
                        India
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-100 mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:support@younique.com"
                        className="text-[#C58B7A] hover:text-white text-sm"
                      >
                        support@younique.com
                      </a>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-100 mb-1">
                        Phone
                      </h3>
                      <a
                        href="tel:+911234567890"
                        className="text-gray-200 hover:text-[#C58B7A] text-sm"
                      >
                        +91 12345 67890
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-8"></div>

        <div className="container mx-auto text-center py-4 text-white">
          <p>Copyright © 2025 Younique</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
