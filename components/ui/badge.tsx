import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-primary text-white",
    secondary: "bg-primary-soft text-primary",
    outline: "border border-border text-foreground",
    destructive: "bg-red-100 text-red-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
