import { ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`rounded-3xl border border-stone-200/70 bg-white/65 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
