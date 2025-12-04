'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Stat {
  label: string;
  value: string | number;
  icon: string;
  description?: string;
}

interface StatsSlideProps {
  title: string;
  stats: Stat[];
  gradient?: string;
}

export default function StatsSlide({
  title,
  stats,
  gradient = 'from-purple-900 via-violet-900 to-indigo-900',
}: StatsSlideProps) {
  // Use grid layout for 4+ stats, list for 3 or less
  const useGrid = stats.length >= 4;

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} relative`}>
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-white/5 blur-3xl"
          style={{ top: '-15%', right: '-5%' }}
        />
        <div 
          className="absolute w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-white/5 blur-3xl"
          style={{ bottom: '5%', left: '-5%' }}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 pt-10 sm:pt-12">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl font-black text-white text-center mb-3 sm:mb-4"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          {title}
        </motion.h2>

        {/* Stats - Grid or List layout */}
        {useGrid ? (
          <div className="w-full max-w-sm grid grid-cols-2 gap-1.5 sm:gap-2">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index, duration: 0.25 }}
                className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/20"
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-0.5">{stat.icon}</div>
                  <p
                    className="text-base sm:text-lg font-black text-white leading-tight"
                    style={{ fontFamily: 'Clash Display, sans-serif' }}
                  >
                    {typeof stat.value === 'number'
                      ? stat.value.toLocaleString('pt-BR')
                      : stat.value}
                  </p>
                  <p className="text-white/60 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider mt-0.5 leading-tight">
                    {stat.label}
                  </p>
                  {stat.description && (
                    <p className="text-white/40 text-[7px] sm:text-[8px] mt-0.5 line-clamp-1">
                      {stat.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-xs space-y-2 sm:space-y-2.5">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p
                      className="text-xl sm:text-2xl font-black text-white truncate"
                      style={{ fontFamily: 'Clash Display, sans-serif' }}
                    >
                      {typeof stat.value === 'number'
                        ? stat.value.toLocaleString('pt-BR')
                        : stat.value}
                    </p>
                    {stat.description && (
                      <p className="text-white/50 text-[10px] sm:text-xs truncate">{stat.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-auto pt-3 sm:pt-4"
        >
          <Image
            src="/logo-branco-medcof.png"
            alt="Medcof"
            width={100}
            height={28}
            className="w-14 sm:w-18 h-auto mx-auto opacity-50"
          />
        </motion.div>
      </div>
    </div>
  );
}
