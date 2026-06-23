import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-bg shadow-card hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100",
  secondary:
    "border border-border bg-surface text-ink hover:bg-surface2 disabled:opacity-50",
  ghost: "text-muted hover:text-ink",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex touch-manipulation items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-info ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
