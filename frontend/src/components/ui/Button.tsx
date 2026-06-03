import React from 'react';
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    
    // Classes base para todos os botões
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Variações de estilo (cores)
    const variants = {
      primary: "bg-[var(--color-accent)] text-black hover:opacity-90",
      secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
      ghost: "bg-transparent text-[var(--color-muted)] hover:text-white hover:bg-white/5",
      outline: "border border-[var(--color-accent)]/20 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20",
    };

    // Variações de tamanho
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
      icon: "p-2", // Geralmente usado quando o conteúdo é apenas um ícone
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
