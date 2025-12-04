'use client';

import { motion } from 'framer-motion';

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
  return (
    <div
      className={`slide-container bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-8`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <h2
          className="text-3xl md:text-4xl font-black text-white text-center mb-10"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          {title}
        </h2>

        <div className="space-y-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.15, duration: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{stat.icon}</div>
                <div className="flex-1">
                  <p className="text-white/60 text-sm font-medium">{stat.label}</p>
                  <motion.p
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.15, type: 'spring' }}
                    className="text-3xl font-black text-white"
                  >
                    {typeof stat.value === 'number'
                      ? stat.value.toLocaleString('pt-BR')
                      : stat.value}
                  </motion.p>
                  {stat.description && (
                    <p className="text-white/50 text-xs mt-1">{stat.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Medcof branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <p className="text-white/40 text-sm font-medium tracking-wider">MEDCOF</p>
      </motion.div>
    </div>
  );
}

