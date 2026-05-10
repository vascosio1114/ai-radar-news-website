'use client';

import { useState, useEffect } from 'react';
import { GlobeScene } from '@/components/globe/GlobeScene';
import { FloatingPanels } from '@/components/globe/FloatingPanels';
import { type Lang } from '@/lib/i18n';

type Props = { params: { lang: string } };

export default function GlobePage({ params }: Props) {
  const [rotation, setRotation] = useState(0);
  const lang = params.lang as Lang;

  useEffect(() => {
    const animate = () => {
      setRotation((prev) => prev + 0.002);
      requestAnimationFrame(animate);
    };
    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#020205] overflow-hidden">
      {/* 3D Globe Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[88vh] h-[88vh]">
          <GlobeScene rotation={rotation} />
        </div>
      </div>

      {/* Floating UI Panels */}
      <FloatingPanels />

      {/* Background bokeh effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,2,5,0.4) 100%)',
        }}
      />
    </div>
  );
}