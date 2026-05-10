'use client';

import { motion } from 'framer-motion';
import { Zap, Flame, TrendingUp } from 'lucide-react';

const panels = [
  {
    icon: Zap,
    iconColor: '#ffcc00',
    label: 'ALERTS',
    value: '247',
    subtext: 'active today',
  },
  {
    icon: Flame,
    iconColor: '#ff3b3b',
    label: 'TRENDING',
    value: '12',
    subtext: 'tools this week',
  },
  {
    icon: TrendingUp,
    iconColor: '#00a2ff',
    label: 'ACTIVE',
    value: '89',
    subtext: 'companies',
  },
];

export function FloatingPanels() {
  return (
    <div className="absolute right-[5%] top-1/2 -translate-y-1/2 flex flex-col gap-[4vh] w-[18%]">
      {panels.map((panel, i) => (
        <motion.div
          key={panel.label}
          className="backdrop-blur-md bg-[rgba(13,13,18,0.65)] border border-[rgba(255,255,255,0.08)] rounded-[15px] p-4 cursor-pointer"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
          whileHover={{
            scale: 1.02,
            borderColor: 'rgba(255, 255, 255, 0.15)',
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <panel.icon size={24} style={{ color: panel.iconColor }} />
            </motion.div>
            <span
              className="text-[11px] tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              {panel.label}
            </span>
          </div>
          <div
            className="text-[28px] font-bold"
            style={{ color: panel.iconColor }}
          >
            {panel.value}
          </div>
          <div
            className="text-[11px] mt-1"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {panel.subtext}
          </div>
        </motion.div>
      ))}
    </div>
  );
}