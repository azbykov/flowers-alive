import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger-quiet";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-stem text-white hover:bg-stem-deep disabled:bg-stem/50",
  secondary:
    "bg-card text-ink border border-line hover:border-stem/40 disabled:opacity-50",
  ghost: "bg-transparent text-stem hover:bg-stem-tint disabled:opacity-50",
  "danger-quiet":
    "bg-transparent text-petal hover:bg-petal-tint disabled:opacity-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition-colors ${VARIANT_CLASSES[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size={18} />}
      {children}
    </button>
  );
}
