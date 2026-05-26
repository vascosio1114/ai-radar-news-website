"use client";

import { motion, useMotionValue, useTransform, useSpring, useInView } from "framer-motion";
import { useEffect, useRef, useState, memo } from "react";

interface CountUpNumberProps {
  target: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

function CountUpNumberComponent({
  target,
  className,
  prefix = "",
  suffix = "",
}: CountUpNumberProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 80,
    damping: 15,
  });

  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest).toLocaleString()
  );

  const [displayText, setDisplayText] = useState("0");

  useEffect(() => {
    if (isInView) {
      motionValue.set(target);
    }
  }, [isInView, target, motionValue]);

  useEffect(() => {
    const unsubscribe = displayValue.on("change", (latest) => {
      setDisplayText(latest);
    });
    return unsubscribe;
  }, [displayValue]);

  return (
    <div ref={ref} className={className}>
      <motion.span
        className={`font-mono text-5xl font-bold tabular-nums ${
          isInView ? "animate-pulse" : ""
        }`}
      >
        {prefix}
        {displayText}
        {suffix}
      </motion.span>
    </div>
  );
}

export const CountUpNumber = memo(CountUpNumberComponent);
