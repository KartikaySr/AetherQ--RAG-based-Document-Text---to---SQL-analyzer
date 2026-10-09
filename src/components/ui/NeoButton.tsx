"use client";
import Link from "next/link";
interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost"; href?: string;
}
export function NeoButton({ children, variant = "primary", href, className = "", ...props }: NeoButtonProps) {
  const styles = { primary: "bg-[#b9edb0] text-[#102017] hover:bg-[#cef8c7]", secondary: "border border-white/15 bg-white/5 text-white hover:bg-white/10", ghost: "text-slate-400 hover:text-white hover:bg-white/5" };
  const classes = `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`;
  if (href) return <Link href={href} className={classes}>{children}</Link>;
  return <button className={classes} {...props}>{children}</button>;
}
