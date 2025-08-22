import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MdHome,
  MdEmojiEvents,
  MdOutlineDateRange,
  MdOutlineMenu,
  MdLogout,
  MdCode,
  MdKeyboardArrowDown
} from 'react-icons/md';
import { GoFileCode,GoGift } from "react-icons/go";

const DashboardNavbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Close the dropdown
    setIsNavOpen(false);
    
    // Show logout success popup
    setShowLogoutPopup(true);
    
    // Navigate to landing page after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  // Function to get active link styles
  const getActiveLinkClass = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? "flex items-center space-x-3 text-violet-400 bg-violet-500/20 px-4 py-3 rounded-lg font-medium border border-violet-400/50"
      : "flex items-center space-x-3 text-white hover:text-violet-400 px-4 py-3 rounded-lg font-medium hover:bg-white/5 transition-colors";
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
      >
        <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">L</span>
        </div>
        <div className="text-left">
          <p className="text-white font-medium text-sm">Lokiiii</p>
          <p className="text-gray-300 text-xs">User</p>
        </div>
        <MdKeyboardArrowDown 
          className={`text-white w-4 h-4 transition-transform duration-300 ${
            isNavOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {/* Profile Dropdown Navigation */}
      {isNavOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl z-50">
          <div className="space-y-4">
            {/* Dashboard Title */}
            <h1 className="text-xl font-bold text-white mb-4">Lokiiii</h1>
            
            {/* Navigation Links */}
            <div className="space-y-2">
              <Link 
                to="/dashboard" 
                className={getActiveLinkClass('/dashboard')}
              >
                <MdHome className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/codeeditor" 
                className={getActiveLinkClass('/codeeditor')}
              >
                <MdCode className="w-5 h-5" />
                <span>Code Editor</span>
              </Link>
              <Link 
                to="/challenges" 
                className={getActiveLinkClass('/challenges')}
              >
                <MdEmojiEvents className="w-5 h-5" />
                <span>Challenges</span>
              </Link>
              <Link 
                to="/dsaproblems" 
                className={getActiveLinkClass('/dsaproblems')}
              >
                <GoFileCode className="w-5 h-5" />
                <span>DSA Problems</span>
              </Link>
              <Link 
                to="/problems" 
                className={getActiveLinkClass('/problems')}
              >
                <MdOutlineMenu className="w-5 h-5" />
                <span>Problems</span>
              </Link>
              
              <Link 
                to="/contests" 
                className={getActiveLinkClass('/contests')}
              >
                <MdOutlineDateRange className="w-5 h-5" />
                <span>Contests</span>
              </Link>
              <Link 
                to="/rewards" 
                className={getActiveLinkClass('/rewards')}
              >
                <GoGift className="w-5 h-5" />
                <span>Rewards</span>
              </Link>
              
              
            </div>

            {/* Bottom Section - Settings and Logout */}
            <div className="space-y-4 pt-4 border-t border-white/20">
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 text-white hover:text-red-400 px-4 py-3 rounded-lg font-medium hover:bg-red-500/20 transition-colors w-full"
              >
                <MdLogout className="w-5 h-5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Logout Success Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl max-w-sm mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Logout Successful!</h3>
              <p className="text-gray-300 text-sm">You have been successfully logged out.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardNavbar;