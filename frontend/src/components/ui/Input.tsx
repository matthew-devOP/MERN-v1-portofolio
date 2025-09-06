import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    isLoading,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'form-input',
              leftIcon && 'pl-10',
              (rightIcon || isLoading) && 'pr-10',
              error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
              className
            )}
            {...props}
          />
          
          {(rightIcon || isLoading) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {isLoading ? (
                <div className="spinner-sm" />
              ) : (
                <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="form-help">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;