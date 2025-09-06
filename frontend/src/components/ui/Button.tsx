import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

interface ButtonAsButtonProps extends BaseButtonProps, ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
}

interface ButtonAsLinkProps extends BaseButtonProps {
  as: typeof Link;
  to: string;
  replace?: boolean;
  state?: any;
}

interface ButtonAsAProps extends BaseButtonProps {
  as: 'a';
  href: string;
  target?: string;
  rel?: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps | ButtonAsAProps;

export const Button = forwardRef<any, ButtonProps>(
  (props, ref) => {
    const {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      as = 'button',
      ...restProps
    } = props;

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

    const content = (
      <>
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
      </>
    );

    if (as === Link) {
      const linkProps = restProps as ButtonAsLinkProps;
      return (
        <Link
          ref={ref}
          className={classes}
          to={linkProps.to}
          replace={linkProps.replace}
          state={linkProps.state}
        >
          {content}
        </Link>
      );
    }

    if (as === 'a') {
      const aProps = restProps as ButtonAsAProps;
      return (
        <a
          ref={ref}
          className={classes}
          href={aProps.href}
          target={aProps.target}
          rel={aProps.rel}
        >
          {content}
        </a>
      );
    }

    // Default button
    const buttonProps = restProps as ButtonAsButtonProps;
    const isDisabled = buttonProps.disabled || isLoading;

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        {...buttonProps}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;