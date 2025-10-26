import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackButton from './BackButton';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          if (errorParam === 'oauth_not_configured') {
            setError('Google OAuth is not configured on the server. Please contact the administrator.');
          } else if (errorParam === 'oauth_failed') {
            setError('Google authentication failed. Please try again.');
          } else {
            setError('Authentication failed. Please try again.');
          }
          setLoading(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!token) {
          setError('No authentication token received.');
          setLoading(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Decode the JWT to get user information (basic decoding, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Store user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userName', payload.fullName || payload.username);
        localStorage.setItem('userEmail', payload.email);
        localStorage.setItem('userAvatar', (payload.fullName || payload.username).substring(0, 2).toUpperCase());
        localStorage.setItem('userId', payload.sub);

        console.log('[AuthCallback] Successfully authenticated:', payload.email);

        // Show success and redirect
        setLoading(false);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);

      } catch (err) {
        console.error('[AuthCallback] Error processing authentication:', err);
        setError('Failed to process authentication. Please try again.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `
          linear-gradient(180deg, rgba(0,0,0,0.7), rgba(0,0,0,0.85)),
          url('/logo-1.jpg') center/cover no-repeat
        `
      }}
    >
      <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-8 shadow-2xl max-w-md w-full">
        <div className="mb-4">
          <BackButton to="/login" text="Back to Login" />
        </div>
        <div className="text-center">
          {loading ? (
            <>
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-white text-xl font-semibold mb-2">
                Completing Sign In...
              </h2>
              <p className="text-white/70 text-sm">
                Please wait while we finish setting up your account.
              </p>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">
                Authentication Failed
              </h2>
              <p className="text-white/70 text-sm">
                {error}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-semibold mb-2">
                Success!
              </h2>
              <p className="text-white/70 text-sm">
                Redirecting to your dashboard...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;

