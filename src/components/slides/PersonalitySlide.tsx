'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PersonalitySlideProps {
  personality: {
    type: string;
    description: string;
  };
  funFact?: string;
}

const personalityEmojis: Record<string, string> = {
  'O Estrategista': '🎯',
  'O Maratonista': '🏃',
  'A Coruja Noturna': '🦉',
  'O Madrugador': '🌅',
  'O Memorizador': '🧠',
  'O Visual': '👁️',
  'O Equilibrado': '⚖️',
};

export default function PersonalitySlide({ personality, funFact }: PersonalitySlideProps) {
  const emoji = personalityEmojis[personality.type] || '✨';

  return (
    <div className="slide-container bg-gradient-to-br from-pink-900 via-rose-900 to-red-900 flex flex-col items-center justify-center p-4 sm:p-8 pt-10 sm:pt-12">
      {/* Animated hearts/stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-lg sm:text-2xl"
            initial={{
              x: Math.random() * 300,
              y: Math.random() * 500,
              opacity: 0,
            }}
            animate={{
              y: [null, -80],
              opacity: [0, 0.3, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            {['✨', '💫', '⭐'][Math.floor(Math.random() * 3)]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-sm sm:text-base mb-2 sm:mb-4 uppercase tracking-wider"
        >
          Sua personalidade de estudo
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="text-5xl sm:text-7xl mb-3 sm:mb-5"
        >
          {emoji}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-2xl sm:text-4xl font-black text-white mb-3 sm:mb-5"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          {personality.type}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-white/20"
        >
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            {personality.description}
          </p>
        </motion.div>

        {funFact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-3 sm:mt-5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-yellow-400/30"
          >
            <p className="text-yellow-100 text-xs sm:text-sm">
              <span className="text-base sm:text-xl mr-1 sm:mr-2">💡</span>
              {funFact}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Medcof branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2"
      >
        <Image
          src="/logo-branco-medcof.png"
          alt="Medcof"
          width={100}
          height={28}
          className="w-16 sm:w-20 h-auto mx-auto opacity-50"
        />
      </motion.div>
    </div>
  );
}
