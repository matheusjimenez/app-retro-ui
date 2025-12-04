'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface IntroSlideProps {
  year: number;
  userName?: string;
}

export default function IntroSlide({ year, userName }: IntroSlideProps) {
  return (
    <div className="slide-container bg-gradient-to-br from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a] flex flex-col items-center justify-center text-center p-4 sm:p-8 pt-10 sm:pt-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ top: '5%', left: '5%' }}
        />
        <motion.div
          className="absolute w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ bottom: '5%', right: '5%' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10"
      >
        {/* Logo Medcof */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <Image
            src="/logo-branco-medcof.png"
            alt="Medcof"
            width={180}
            height={50}
            className="w-32 sm:w-44 h-auto mx-auto"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-black mb-2 sm:mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          SEU {year}
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90 mb-4 sm:mb-6"
        >
          na MED
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-4 sm:mt-8"
        >
          <p className="text-white/60 text-sm sm:text-lg mb-1 sm:mb-2">Preparado para</p>
          <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {userName || 'Você'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-6 sm:mt-10 flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Slogan */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-white/50 text-xs sm:text-sm font-medium italic tracking-wide">
          &quot;A medicina merece o melhor&quot;
        </p>
      </motion.div>
    </div>
  );
}
