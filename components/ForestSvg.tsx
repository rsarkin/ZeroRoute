'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../types';

interface ForestSvgProps {
  reductionPercent: number;
  badges: Badge[];
}

export const ForestSvg: React.FC<ForestSvgProps> = ({ reductionPercent, badges }) => {
  // Determine growth stage
  // Baseline (0-4.9%) -> Seedling
  // 5%-14.9% -> Sapling
  // 15%-24.9% -> Young Tree
  // 25%-29.9% -> Full Tree
  // 30%+ -> Flowering Tree
  let stage: 'seedling' | 'sapling' | 'young' | 'full' | 'flowering' = 'seedling';
  if (reductionPercent >= 30) {
    stage = 'flowering';
  } else if (reductionPercent >= 25) {
    stage = 'full';
  } else if (reductionPercent >= 15) {
    stage = 'young';
  } else if (reductionPercent >= 5) {
    stage = 'sapling';
  }

  // Pre-defined coordinates for badge trees around the main tree (centered at 200, 200)
  const badgePlacements = [
    { x: 70, y: 220, scale: 0.6 },
    { x: 330, y: 220, scale: 0.6 },
    { x: 110, y: 240, scale: 0.7 },
    { x: 290, y: 240, scale: 0.7 },
    { x: 50, y: 260, scale: 0.5 },
    { x: 350, y: 260, scale: 0.5 },
    { x: 150, y: 250, scale: 0.8 },
    { x: 250, y: 250, scale: 0.8 },
    { x: 90, y: 270, scale: 0.6 },
    { x: 310, y: 270, scale: 0.6 },
    { x: 190, y: 260, scale: 0.75 },
    { x: 210, y: 270, scale: 0.7 },
  ];

  return (
    <div className="w-full h-96 relative rounded-2xl border border-[#e5e3df] bg-linear-to-b from-[#e0f2fe] to-[#f0fdf4] dark:from-[#0a1530] dark:to-[#0f2d19] overflow-hidden shadow-inner flex items-center justify-center">
      
      {/* Sky details / sun / clouds */}
      <div className="absolute top-6 left-6 flex items-center space-x-2 opacity-80">
        <div className="w-12 h-12 bg-amber-400 rounded-full blur-xs shadow-lg shadow-amber-300/40" />
      </div>
      
      <div className="absolute top-10 right-10 bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm border border-white/50">
        Reduction: {reductionPercent.toFixed(1)}% ({stage.toUpperCase()})
      </div>

      <svg viewBox="0 0 400 300" className="w-full h-full max-w-lg">
        {/* Ground */}
        <path d="M 0 240 Q 200 220 400 240 L 400 300 L 0 300 Z" fill="#4ade80" className="dark:fill-[#155e27]" />
        <path d="M 0 260 Q 200 245 400 260 L 400 300 L 0 300 Z" fill="#22c55e" className="dark:fill-[#166534]" />
        
        {/* Badge Trees (Milestone Forest) */}
        {badges.map((badge, index) => {
          const pos = badgePlacements[index % badgePlacements.length];
          let color = '#15803d'; // Default green tree
          
          if (badge.badgeKey === 'ev_pioneer') {
            color = '#0ea5e9'; // Electric blue for EV
          } else if (badge.badgeKey === 'society_topper') {
            color = '#fbbf24'; // Golden for No. 1
          }

          return (
            <motion.g 
              key={badge.id}
              initial={{ scale: 0, opacity: 0, y: pos.y + 20 }}
              animate={{ scale: pos.scale, opacity: 1, y: pos.y }}
              transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
              className="cursor-pointer"
            >
              {/* Trunk */}
              <rect x={pos.x - 3} y={0} width={6} height={20} fill="#78350f" />
              {/* Canopy */}
              {badge.badgeKey === 'ev_pioneer' ? (
                // Lightning bolt or blue canopy
                <path d={`M ${pos.x} -25 L ${pos.x - 12} -5 L ${pos.x + 12} -5 Z`} fill={color} />
              ) : (
                <circle cx={pos.x} cy={-5} r={14} fill={color} />
              )}
              {/* Indicator/Label above tree */}
              <text x={pos.x} y={-22} fontSize={12} textAnchor="middle" className="pointer-events-none select-none">
                {badge.badgeKey === 'ev_pioneer' ? '⚡' : badge.badgeKey === 'society_topper' ? '🏆' : '🌱'}
              </text>
            </motion.g>
          );
        })}

        {/* Main Family Tree */}
        <g transform="translate(200, 235)">
          {/* Trunk - grows thicker in higher stages */}
          <motion.path 
            d={
              stage === 'seedling' ? 'M -3 0 L -2 -30 Q 0 -40 2 -30 L 3 0 Z' :
              stage === 'sapling' ? 'M -6 0 L -4 -50 Q 0 -60 4 -50 L 6 0 Z' :
              stage === 'young' ? 'M -10 0 L -6 -60 Q 0 -80 6 -60 L 10 0 Z' :
              'M -15 0 L -9 -75 Q 0 -100 9 -75 L 15 0 Z'
            }
            fill="#5c3a21" 
            layoutId="trunk"
            transition={{ duration: 0.8 }}
          />

          {/* Seedling Leaves */}
          {stage === 'seedling' && (
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
              <path d="M 0 -35 Q -15 -45 -15 -30 Q -15 -20 0 -35" fill="#22c55e" />
              <path d="M 0 -35 Q 15 -45 15 -30 Q 15 -20 0 -35" fill="#15803d" />
            </motion.g>
          )}

          {/* Sapling Canopy */}
          {stage === 'sapling' && (
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
              <circle cx="-10" cy="-55" r="16" fill="#22c55e" opacity="0.9" />
              <circle cx="10" cy="-55" r="16" fill="#16a34a" opacity="0.9" />
              <circle cx="0" cy="-68" r="18" fill="#15803d" />
            </motion.g>
          )}

          {/* Young Tree Canopy */}
          {stage === 'young' && (
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
              {/* Branches */}
              <path d="M -5 -40 L -25 -65" stroke="#5c3a21" strokeWidth="3" strokeLinecap="round" />
              <path d="M 5 -40 L 25 -65" stroke="#5c3a21" strokeWidth="3" strokeLinecap="round" />
              {/* Foliage */}
              <circle cx="-25" cy="-68" r="22" fill="#22c55e" opacity="0.95" />
              <circle cx="25" cy="-68" r="22" fill="#16a34a" opacity="0.95" />
              <circle cx="0" cy="-80" r="26" fill="#15803d" />
            </motion.g>
          )}

          {/* Full / Flowering Tree Canopy */}
          {(stage === 'full' || stage === 'flowering') && (
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
              {/* Branches */}
              <path d="M -6 -50 L -35 -80" stroke="#5c3a21" strokeWidth="5" strokeLinecap="round" />
              <path d="M 6 -50 L 35 -80" stroke="#5c3a21" strokeWidth="5" strokeLinecap="round" />
              <path d="M 0 -50 L 0 -90" stroke="#5c3a21" strokeWidth="4" strokeLinecap="round" />
              
              {/* Foliage layers */}
              <circle cx="-35" cy="-85" r="28" fill="#22c55e" opacity="0.9" />
              <circle cx="35" cy="-85" r="28" fill="#16a34a" opacity="0.9" />
              <circle cx="-15" cy="-100" r="32" fill="#15803d" />
              <circle cx="15" cy="-100" r="32" fill="#166534" />
              <circle cx="0" cy="-115" r="35" fill="#14532d" />
              
              {/* Flowers/Fruits for Flowering Stage */}
              {stage === 'flowering' && (
                <g>
                  {/* Small red and pink flower/fruit circles */}
                  <circle cx="-25" cy="-90" r="4" fill="#ef4444" />
                  <circle cx="20" cy="-80" r="4.5" fill="#ec4899" />
                  <circle cx="-5" cy="-115" r="4.5" fill="#ef4444" />
                  <circle cx="15" cy="-110" r="4" fill="#ec4899" />
                  <circle cx="-35" cy="-75" r="4.5" fill="#facc15" />
                  <circle cx="35" cy="-75" r="4" fill="#ef4444" />
                </g>
              )}
            </motion.g>
          )}
        </g>
      </svg>
    </div>
  );
};
