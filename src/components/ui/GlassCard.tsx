"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function GlassCard({
  children,
  className = "",
  href,
  onClick,
  interactive = true,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tracking cursor
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  // Transform constraints for 3D tilt
  const rotateX = useTransform(springY, [0, 1], [10, -10]);
  const rotateY = useTransform(springX, [0, 1], [-10, 10]);

  // Glare effect using a radial gradient
  const background = useMotionTemplate`radial-gradient(
    400px circle at ${useTransform(springX, (v) => v * 100)}% ${useTransform(
    springY,
    (v) => v * 100
  )}%,
    rgba(255, 255, 255, 0.1),
    transparent 40%
  )`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const Component = motion.div;

  const innerContent = (
    <Component
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
        transformPerspective: 1000,
      }}
      className={`relative group overflow-hidden rounded-[40px] border border-amber-500/10 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5),inset_0_1px_1px_0_rgba(251,191,36,0.15)] transition-colors duration-500 hover:border-amber-400/30 ${className}`}
      onClick={onClick}
    >
      {/* Dynamic Glare */}
      {interactive && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
          style={{ background }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />
      )}
      
      {/* Content wrapper to stay above glare */}
      <div className="relative z-10 h-full">{children}</div>
    </Component>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full outline-none">
        {innerContent}
      </Link>
    );
  }

  return innerContent;
}
