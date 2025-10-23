
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses =
    'rounded-lg font-semibold text-white shadow-md transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} hover:shadow-lg active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
