'use client';

import { motion } from 'framer-motion';

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
    <div className="slide-container bg-gradient-to-br from-pink-900 via-rose-900 to-red-900 flex flex-col items-center justify-center p-8">
      {/* Animated hearts/stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{
              x: Math.random() * 400,
              y: Math.random() * 800,
              opacity: 0,
            }}
            animate={{
              y: [null, -100],
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
        className="relative z-10 w-full max-w-md text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-lg mb-4 uppercase tracking-wider"
        >
          Sua personalidade de estudo
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="text-8xl mb-6"
        >
          {emoji}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-4xl md:text-5xl font-black text-white mb-6"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          {personality.type}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <p className="text-white/90 text-lg leading-relaxed">
            {personality.description}
          </p>
        </motion.div>

        {funFact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-5 border border-yellow-400/30"
          >
            <p className="text-yellow-100 text-base">
              <span className="text-xl mr-2">💡</span>
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <p className="text-white/40 text-sm font-medium tracking-wider">MEDCOF</p>
      </motion.div>
    </div>
  );
}

