import React from 'react';

const Badge = ({
                   children,
                   variant = 'default',
                   size = 'md',
                   className = ''
               }) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full';

    const variantStyles = {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-red-100 text-red-800',
        outline: 'border border-gray-300 text-gray-700',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800'
    };

    const sizeStyles = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    return (
        <span
            className={`${baseStyles} ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size] || sizeStyles.md} ${className}`}
        >
      {children}
    </span>
    );
};

export default Badge;