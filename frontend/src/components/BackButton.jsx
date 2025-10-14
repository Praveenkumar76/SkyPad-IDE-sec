import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

const BackButton = ({ 
  to = '/dashboard', 
  text = 'Back to Dashboard',
  className = '',
  icon = true 
}) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center space-x-2 text-white/70 hover:text-white transition-colors group ${className}`}
    >
      {icon && <MdArrowBack className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />}
      <span className="text-sm font-medium">{text}</span>
    </button>
  );
};

export default BackButton;
