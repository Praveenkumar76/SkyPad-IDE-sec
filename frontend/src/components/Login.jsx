import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setIsSubmitting(true);
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/dashboard');
      }, 1200);
    } catch (error) {
      alert(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !username || !password || password !== confirm) {
      return alert('Please fill all fields and ensure passwords match.');
    }
    try {
      setIsSubmitting(true);
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/dashboard');
      }, 1200);
    } catch (error) {
      alert(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = isLogin ? handleLogin : handleRegister;

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        background: `
          linear-gradient(135deg, #667eea 0%, #764ba2 100%),
          radial-gradient(circle at 20% 80%, rgba(255,105,180,0.4) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255,165,0,0.4) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120,119,198,0.3) 0%, transparent 50%)
        `,
        backgroundBlendMode: 'multiply, overlay, overlay, normal'
      }}
    >
      {/* Mountain silhouette overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%),
            linear-gradient(45deg, transparent 60%, rgba(139,69,19,0.3) 70%, rgba(160,82,45,0.4) 80%, rgba(101,67,33,0.5) 90%, rgba(62,39,35,0.6) 100%)
          `
        }}
      />
      
      <div className="w-full max-w-md relative z-10">
        {/* Glass morphism card */}
        <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-2xl font-light mb-2">
              {isLogin ? 'Welcome' : 'Create Account'}
            </h1>
            <p className="text-white/70 text-sm">
              {isLogin 
                ? 'Please sign in to your account' 
                : 'Join us and start your journey'
              }
            </p>
          </div>

          <div className="space-y-6">
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                required
              />
              <svg className="w-5 h-5 text-white/70 absolute right-4 top-1/2 transform -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>

            {/* Username (only for signup) */}
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                  required
                />
                <svg className="w-5 h-5 text-white/70 absolute right-4 top-1/2 transform -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5 text-white/70 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white/70 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Confirm Password (only for signup) */}
            {!isLogin && (
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 focus:outline-none"
                >
                  {showConfirm ? (
                    <svg className="w-5 h-5 text-white/70 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white/70 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Remember me / Forgot password (only for login) */}
            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 mr-2 accent-white/70"
                  />
                  Remember me
                </label>
                <button 
                  type="button"
                  className="text-white/70 hover:text-white transition-colors"
                  onClick={() => console.log('Forgot password clicked')}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-medium text-white transition-all duration-300 transform ${
                isSubmitting 
                  ? 'bg-white/30 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-lg'
              }`}
            >
              {isSubmitting 
                ? (isLogin ? 'Signing in...' : 'Creating...')
                : (isLogin ? 'LOGIN' : 'SIGN UP')
              }
            </button>

            {/* Social Login */}
            <div className="text-center text-white/70 text-sm mb-4">
              OR LOGIN WITH
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              {/* Google */}
              <button
                onClick={() => console.log('Google login clicked')}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              {/* Facebook */}
              <button
                onClick={() => console.log('Facebook login clicked')}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="#fff" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>

            {/* Toggle between login and signup */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  // Reset form
                  setEmail('');
                  setUsername('');
                  setPassword('');
                  setConfirm('');
                  setShowPassword(false);
                  setShowConfirm(false);
                }}
                className="text-white/70 hover:text-white transition-colors text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl max-w-sm mx-4 animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {isLogin ? 'Login Successful!' : 'Registration Successful!'}
              </h3>
              <p className="text-gray-300 text-sm">
                {isLogin 
                  ? 'Welcome back! You have been successfully logged in.'
                  : 'Welcome! Your account has been successfully created.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;