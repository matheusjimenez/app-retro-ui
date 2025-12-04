'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface TopItem {
  rank: number;
  title: string;
  value: string;
  icon?: string;
}

interface TopListSlideProps {
  title: string;
  subtitle?: string;
  items: TopItem[];
  gradient?: string;
}

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function TopListSlide({
  title,
  subtitle,
  items,
  gradient = 'from-emerald-900 via-teal-900 to-cyan-900',
}: TopListSlideProps) {
  return (
    <div
      className={`slide-container bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4 sm:p-8 pt-10 sm:pt-12`}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * 300,
              y: Math.random() * 600,
            }}
            animate={{
              y: [null, -80],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-4 sm:mb-6">
          <h2
            className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            {title}
          </h2>
          {subtitle && <p className="text-white/60 text-xs sm:text-sm">{subtitle}</p>}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: 0.2 + index * 0.1,
                duration: 0.4,
                type: 'spring',
                stiffness: 100,
              }}
              className={`
                relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-4
                ${index === 0 ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-2 border-yellow-400/50' : 'bg-white/10 border border-white/20'}
              `}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                  className={`
                    w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-white/20'}
                  `}
                >
                  {item.icon || rankEmojis[index]}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold truncate ${index === 0 ? 'text-base sm:text-lg text-yellow-100' : 'text-sm sm:text-base text-white'}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-xs sm:text-sm truncate">{item.value}</p>
                </div>

                <div
                  className={`
                    text-lg sm:text-xl font-black flex-shrink-0
                    ${index === 0 ? 'text-yellow-400' : 'text-white/40'}
                  `}
                >
                  #{item.rank}
                </div>
              </div>

              {/* Shine effect for #1 */}
              {index === 0 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Medcof branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
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
