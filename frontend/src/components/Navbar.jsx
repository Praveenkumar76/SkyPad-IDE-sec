import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-50 border border-white/10">
      <div className="flex justify-between items-center min-w-[600px]">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="SKYPAD-IDE Logo"
              className="h-8 w-8 mr-2 rounded"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <span className="text-xl font-bold">
              <span className="text-white">SKYPAD</span>
              <span className="text-violet-400">-IDE</span>
            </span>
          </Link>
        </div>

        {/* All Menu Items in Single Line */}
        <div className="flex items-center space-x-4">
          <button className="text-white hover:text-violet-400 transition-colors duration-300 text-sm">
            Contact
          </button>
          <Link
            to="/login"
            className="text-white hover:text-violet-400 transition-colors duration-300 text-sm"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="hover:text-violet-400 text-white px-4 py-2 rounded-full transition-colors duration-300 text-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
