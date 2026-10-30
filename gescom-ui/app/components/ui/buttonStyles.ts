export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-green text-white hover:bg-brand-light",
  secondary: "border border-gray-300 bg-white text-brand-dark hover:bg-gray-50",
  danger: "border border-red-300 bg-white text-red-600 hover:bg-red-50",
  ghost: "text-brand-green hover:bg-brand-bg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

export function buttonClasses(variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, extra = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${extra}`.trim();
}
