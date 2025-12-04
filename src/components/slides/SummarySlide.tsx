'use client';

import { motion } from 'framer-motion';

interface SummarySlideProps {
  year: number;
  totalHours: number;
  questionsTotal: number;
  accuracyRate: number;
  studyStreak: number;
  userName?: string;
}

export default function SummarySlide({
  year,
  totalHours,
  questionsTotal,
  accuracyRate,
  studyStreak,
  userName,
}: SummarySlideProps) {
  return (
    <div className="slide-container bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#0a0a0a] flex flex-col items-center justify-center p-8">
      {/* Confetti animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: 200,
              y: -20,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: Math.random() * 400,
              y: 900,
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'linear',
            }}
          >
            <div
              className={`w-3 h-3 ${
                ['bg-cyan-400', 'bg-purple-400', 'bg-pink-400', 'bg-yellow-400', 'bg-green-400'][
                  Math.floor(Math.random() * 5)
                ]
              }`}
              style={{
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold text-white/80 mb-2"
        >
          Parabéns, {userName || 'Estudante'}!
        </motion.h2>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          Você arrasou em {year}!
        </motion.h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { label: 'Horas de estudo', value: `${Math.round(totalHours)}h`, icon: '⏱️' },
            { label: 'Questões feitas', value: questionsTotal.toLocaleString('pt-BR'), icon: '📝' },
            { label: 'Taxa de acerto', value: `${accuracyRate.toFixed(0)}%`, icon: '🎯' },
            { label: 'Maior sequência', value: `${studyStreak} dias`, icon: '🔥' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-5 border border-cyan-400/30"
        >
          <p className="text-white/90 text-lg font-medium">
            Continue assim em {year + 1}! 🚀
          </p>
          <p className="text-white/60 text-sm mt-2">
            Seu futuro paciente agradece sua dedicação
          </p>
        </motion.div>
      </motion.div>

      {/* Medcof branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <p className="text-white/40 text-sm font-medium tracking-wider">MEDCOF</p>
      </motion.div>
    </div>
  );
}

