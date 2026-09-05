import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { Animated3DPPEIcon, PPEType } from '../3d/Animated3DPPEIcon';
import { useWorkerSafetyStore } from '../../stores/useWorkerSafetyStore';
import { PPEComplianceState } from '../../types/dashboard';

interface PPECardMeta {
  key: keyof PPEComplianceState;
  type: PPEType;
  title: string;
  code: string;
  standard: string;
  floatDelay: number;
}

const PPE_DECK_CONFIG: PPECardMeta[] = [
  { key: 'helmet', type: 'helmet', title: 'Hard Hat & Lamp', code: 'PPE-HLM-01', standard: 'EN 397 Standard', floatDelay: 0 },
  { key: 'safetyJacket', type: 'jacket', title: 'High-Vis Jacket', code: 'PPE-JKT-02', standard: 'ISO 20471 Class 3', floatDelay: 0.15 },
  { key: 'respiratorMask', type: 'mask', title: 'Gas Respirator', code: 'PPE-MSK-03', standard: 'FFP3 / Particulate', floatDelay: 0.3 },
  { key: 'steelBoots', type: 'boots', title: 'Steel Toe Boots', code: 'PPE-BOT-04', standard: 'ISO 20345 Anti-Static', floatDelay: 0.45 },
  { key: 'gloves', type: 'gloves', title: 'Kevlar Gloves', code: 'PPE-GLV-05', standard: 'EN 388 Level 4', floatDelay: 0.6 },
];

export const PPEChecklistDeck: React.FC = () => {
  const currentWorker = useWorkerSafetyStore((state) => state.currentWorker);
  const togglePPEItem = useWorkerSafetyStore((state) => state.togglePPEItem);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const compliance = currentWorker.ppeCompliance;

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="font-hud text-xs font-bold text-white tracking-wider uppercase">
            REQUIRED PPE SAFETY GEAR CHECKLIST (3D)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          HOVER 3D MODELS • CLICK TO TOGGLE
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {PPE_DECK_CONFIG.map((item) => {
          const isEquipped = compliance[item.key];
          const isHovered = hoveredItem === item.key;

          return (
            <motion.div
              key={item.key}
              onMouseEnter={() => setHoveredItem(item.key)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => togglePPEItem(item.key)}
              whileHover={{ scale: 1.025, y: -4 }}
              animate={{
                y: [0, -5, 0, 5, 0],
                transition: {
                  duration: 4 + item.floatDelay,
                  delay: item.floatDelay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              className={`relative cursor-pointer rounded-xl border p-3 backdrop-blur-xl transition-all duration-300 flex flex-col items-center text-center shadow-xl select-none ${
                isEquipped
                  ? 'border-emerald-500/35 bg-[#091D2E]/80 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:border-emerald-400/60'
                  : 'border-rose-500/40 bg-[#1A0C16]/85 shadow-[0_0_20px_rgba(255,77,90,0.2)] hover:border-rose-400/70 animate-pulse'
              }`}
            >
              {/* Top Accent Bevel */}
              <div
                className={`absolute inset-x-0 top-0 h-[2px] ${
                  isEquipped
                    ? 'bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-rose-400/60 to-transparent'
                }`}
              />

              {/* Status Pill Header */}
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-[9px] font-mono text-slate-400 font-semibold">
                  {item.code}
                </span>
                <span
                  className={`flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isEquipped
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-500/50'
                  }`}
                >
                  {isEquipped ? (
                    <>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>OK</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-2.5 h-2.5" />
                      <span>MISSING</span>
                    </>
                  )}
                </span>
              </div>

              {/* 3D Interactive Model Canvas */}
              <div className="my-1">
                <Animated3DPPEIcon
                  type={item.type}
                  isActive={isEquipped}
                  size={64}
                  isHovered={isHovered}
                />
              </div>

              {/* Titles */}
              <span className="font-hud text-xs font-bold text-white tracking-wide mt-1">
                {item.title}
              </span>
              <span className="text-[9px] font-tech text-cyan-300/80 mt-0.5">
                {item.standard}
              </span>

              {/* Interactive Toggle Pill */}
              <div className="mt-2.5 pt-2 border-t border-slate-700/50 w-full flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white">
                {isEquipped ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">DETECTED</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-400 font-bold">DISABLED</span>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
