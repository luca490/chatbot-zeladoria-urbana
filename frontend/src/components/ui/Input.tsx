import React from 'react';
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-black/5 dark:bg-black/40 border border-[var(--color-border)] text-[var(--color-foreground)] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all placeholder:text-[var(--color-muted)]",
            icon && "pl-10",
            className
          )}
          {...props}
        />

      </div>
    );
  }
);

Input.displayName = "Input";
