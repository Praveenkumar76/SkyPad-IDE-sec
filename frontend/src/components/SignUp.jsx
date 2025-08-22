import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdEmail,
  MdPerson,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdCode,
} from "react-icons/md";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !username || !password || password !== confirm) {
      return alert('Please fill all fields and ensure passwords match.');
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Registration failed');
      }
      setShowRegisterPopup(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (error) {
      alert(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex overflow-hidden min-h-[500px]">
        {/* Left Side - Image and Logo */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-orange-100 to-blue-100 p-8 relative">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center w-full">
            <img
              src="/register.png"
              alt="Sign up illustration"
              className="w-full object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Sign up</h2>
          <p className="mb-6 text-gray-600 text-sm">
            If you already have an account register
            <br />
            You can{" "}
            <Link
              to="/login"
              className="text-red-500 font-semibold hover:underline"
            >
              Login here !
            </Link>
          </p>

          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full py-2.5 pl-10 pr-4 border-0 border-b-2 border-gray-200 focus:border-red-500 focus:outline-none focus:ring-0 bg-transparent text-gray-800 placeholder-gray-400 transition-colors duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <MdEmail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your User name"
                  className="w-full py-2.5 pl-10 pr-4 border-0 border-b-2 border-gray-200 focus:border-red-500 focus:outline-none focus:ring-0 bg-transparent text-gray-800 placeholder-gray-400 transition-colors duration-200"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <MdPerson className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your Password"
                  className="w-full py-2.5 pl-10 pr-10 border-0 border-b-2 border-gray-200 focus:border-red-500 focus:outline-none focus:ring-0 bg-transparent text-gray-800 placeholder-gray-400 transition-colors duration-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <MdLock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                >
                  {showPassword ? (
                    <MdVisibility className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <MdVisibilityOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your Password"
                  className="w-full py-2.5 pl-10 pr-10 border-0 border-b-2 border-gray-200 focus:border-red-500 focus:outline-none focus:ring-0 bg-transparent text-gray-800 placeholder-gray-400 transition-colors duration-200"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <MdLock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
                >
                  {showConfirm ? (
                    <MdVisibility className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <MdVisibilityOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-6 py-3 rounded-full text-white font-semibold text-base shadow-lg transition-all duration-300 transform ${isSubmitting ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600 hover:scale-105'}`}
            >
              {isSubmitting ? 'Creating...' : 'Register'}
            </button>

            {/* Google Sign-In */}
            <div className="mt-3">
              <a
                href="http://localhost:5000/auth/google"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
              >
                {/* Google logo (SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.884 31.91 29.322 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.152 7.961 3.039l5.657-5.657C34.676 5.053 29.627 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.818C14.373 16.087 18.799 13 24 13c3.059 0 5.842 1.152 7.961 3.039l5.657-5.657C34.676 5.053 29.627 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 43c5.258 0 10.051-2.013 13.651-5.289l-6.291-5.316C29.322 35 24.884 37 20 37c-4.274 0-8.068-2.163-10.289-5.453l-6.5 5.006C6.438 40.556 14.59 43 24 43z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.344 3.91-5.906 7-11.303 7-4.884 0-9.322-2-12.289-5.453l-6.5 5.006C8.656 40.663 15.318 45 24 45c10.373 0 19-8.627 19-19 0-1.341-.138-2.651-.389-3.917z"/>
                </svg>
                <span className="text-sm font-medium">Sign in with Google</span>
              </a>
            </div>
          </form>
        </div>
      </div>
      
      {/* Registration Success Popup */}
      {showRegisterPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl max-w-sm mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Registration Successful!</h3>
              <p className="text-gray-300 text-sm">Welcome! Your account has been successfully created.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
