import React from "react";

export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-brand-400 border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}

export function PageLoader({ message = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Spinner size="lg" />
      <p className="text-brand-200 text-sm animate-pulse">{message}</p>
    </div>
  );
}

export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-brand-800 text-brand-200",
    success: "bg-green-900/60 text-green-300 border border-green-700/50",
    warning: "bg-yellow-900/60 text-yellow-300 border border-yellow-700/50",
    danger: "bg-red-900/60 text-red-300 border border-red-700/50",
    info: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
    champion: "bg-amber-900/60 text-amber-300 border border-amber-600/50",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-surface border border-surface-border rounded-xl backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-brand-400 hover:bg-brand-500 text-white shadow-lg shadow-brand-400/20 disabled:bg-brand-800 disabled:text-brand-300/50",
    secondary:
      "bg-surface-light hover:bg-brand-800 text-brand-200 border border-surface-border disabled:opacity-50",
    danger:
      "bg-red-600 hover:bg-red-700 text-white disabled:bg-red-900 disabled:text-red-300/50",
    ghost:
      "bg-transparent hover:bg-brand-800/50 text-brand-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-400/50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export const Input = React.forwardRef(function Input({ label, error, className = "", ...props }, ref) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm text-brand-200 font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-surface-light border rounded-lg text-white placeholder-brand-300/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 ${
          error ? "border-red-500 focus:ring-red-400/40" : "border-surface-border"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
});

export const Select = React.forwardRef(function Select({ label, error, children, className = "", ...props }, ref) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm text-brand-200 font-medium">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-4 py-3 bg-surface-light border rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400/40 focus:border-brand-400 appearance-none ${
          error ? "border-red-500 focus:ring-red-400/40" : "border-surface-border"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
});
