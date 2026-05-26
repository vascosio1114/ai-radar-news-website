"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowSquareOut } from "@phosphor-icons/react";
import Image from "next/image";

interface DemoPage {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

const demoPages: DemoPage[] = [
  {
    id: "kroma",
    title: "KROMA Studio",
    description: "Creative branding agency. Strategic branding and digital experiences for ambitious companies.",
    thumbnail: "https://picsum.photos/seed/kroma/1200/800",
    url: "/demo/kroma.html",
  },
];

export function DemoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const totalCards = demoPages.length;

  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCards);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovering, totalCards]);

  const handleCardClick = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Cards */}
      <div className="relative h-[420px] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {demoPages.map((page, index) => {
            const isActive = index === currentIndex;
            return (
              <motion.div
                key={page.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                  opacity: isActive ? 1 : 0.4,
                  scale: isActive ? 1 : 0.85,
                  y: isActive ? 0 : 20,
                }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  onClick={() => handleCardClick(page.url)}
                  className={`
                    group relative w-full max-w-3xl rounded-2xl overflow-hidden cursor-pointer
                    border border-zinc-800/50 bg-zinc-900
                    ${isActive ? "ring-1 ring-zinc-700/50" : ""}
                  `}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={page.thumbnail}
                      alt={page.title}
                      width={1200}
                      height={800}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent" />

                    {/* View button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/50">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 text-sm font-medium rounded-lg">
                        <span>View Project</span>
                        <ArrowSquareOut className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h4 className="text-lg font-medium mb-1">{page.title}</h4>
                    <p className="text-sm text-zinc-500">{page.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {demoPages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 h-2 bg-white"
                  : "w-2 h-2 bg-zinc-700 hover:bg-zinc-600"
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)}
            className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-zinc-500" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % totalCards)}
            className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>
    </div>
  );
}