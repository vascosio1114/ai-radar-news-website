'use client';

import { GlobeScene } from '@/components/globe/GlobeScene';
import { FloatingPanels } from '@/components/globe/FloatingPanels';
import { type Lang } from '@/lib/i18n';

type Props = { params: { lang: string } };

export default function GlobePage({ params }: Props) {
  const lang = params.lang as Lang;

  return (
    <div className="relative w-full h-screen bg-[#020205] overflow-hidden">
      {/* 3D Globe Canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[88vh] h-[88vh]">
          <GlobeScene />
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