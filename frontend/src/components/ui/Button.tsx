import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = 'btn inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      success: 'btn-success',
      warning: 'btn-warning',
      error: 'btn-error',
      outline: 'btn-outline-primary',
      ghost: 'btn-ghost',
    };

    const sizeClasses = {
      sm: 'btn-sm',
      md: '', // Default size
      lg: 'btn-lg',
      xl: 'btn-xl',
    };

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <div className={clsx('spinner-sm mr-2', size === 'sm' && 'spinner-sm')}>
          </div>
        )}
        
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        <span>
          {isLoading && loadingText ? loadingText : children}
        </span>
        
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;