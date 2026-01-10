import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'pending' | 'in-progress' | 'done';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Badge({ variant = 'default', size = 'md', children, className, ...props }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
