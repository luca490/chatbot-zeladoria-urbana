"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const PARTICLES = [
  { size: 4, left: "12%", top: "18%", duration: 15, delay: 0 },
  { size: 6, left: "85%", top: "12%", duration: 22, delay: 1 },
  { size: 3, left: "42%", top: "72%", duration: 18, delay: 2 },
  { size: 5, left: "28%", top: "58%", duration: 25, delay: 0.5 },
  { size: 7, left: "75%", top: "68%", duration: 20, delay: 1.5 },
  { size: 4, left: "8%", top: "82%", duration: 16, delay: 3 },
  { size: 5, left: "92%", top: "78%", duration: 24, delay: 2.2 },
  { size: 3, left: "58%", top: "22%", duration: 19, delay: 0.8 },
  { size: 6, left: "32%", top: "38%", duration: 21, delay: 1.2 },
  { size: 4, left: "78%", top: "42%", duration: 23, delay: 1.8 }
];

export default function Background() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 35, stiffness: 150, mass: 0.5 };
  const blobX = useSpring(mouseX, springConfig);
  const blobY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 200);
      mouseY.set(e.clientY - 200);
    };

    mouseX.set(window.innerWidth / 2 - 200);
    mouseY.set(window.innerHeight / 2 - 200);

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none -z-10 bg-[var(--color-background)]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_75%,transparent_100%)]"></div>


      {mounted && (
        <>
          {/* Partículas com posições pré-definidas para consistência na hidratação do SSR */}
          {PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute bg-[var(--color-accent)]/15 rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                top: p.top,
              }}
              animate={{
                y: [0, -45, 0],
                x: [0, 15, 0],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            style={{
              x: blobX,
              y: blobY,
            }}
            className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[var(--color-accent)]/15 to-white/5 blur-[100px]"
          />
        </>
      )}
    </div>
  );
}
