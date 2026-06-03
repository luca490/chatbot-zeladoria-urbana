import React from 'react';
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variantClasses?: string;
}

export const Badge = ({ children, icon, variantClasses, className, ...props }: BadgeProps) => {
  return (
    <span 
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 w-fit",
        variantClasses,
        className
      )}
      {...props}
    >
      {icon && <span className="w-3 h-3 flex items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
};
