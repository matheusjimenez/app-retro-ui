'use client';

import { motion } from 'framer-motion';

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

const rankColors = [
  'from-yellow-400 to-amber-500', // 1st
  'from-gray-300 to-gray-400', // 2nd
  'from-orange-400 to-orange-600', // 3rd
  'from-cyan-400 to-cyan-500', // 4th
  'from-purple-400 to-purple-500', // 5th
];

const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

export default function TopListSlide({
  title,
  subtitle,
  items,
  gradient = 'from-emerald-900 via-teal-900 to-cyan-900',
}: TopListSlideProps) {
  return (
    <div
      className={`slide-container bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-8`}
    >
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * 400,
              y: Math.random() * 800,
            }}
            animate={{
              y: [null, -100],
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
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl font-black text-white mb-2"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            {title}
          </h2>
          {subtitle && <p className="text-white/60 text-sm">{subtitle}</p>}
        </div>

        <div className="space-y-3">
          {items.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: 0.3 + index * 0.12,
                duration: 0.5,
                type: 'spring',
                stiffness: 100,
              }}
              className={`
                relative overflow-hidden rounded-xl p-4
                ${index === 0 ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-2 border-yellow-400/50' : 'bg-white/10 border border-white/20'}
              `}
            >
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.12, type: 'spring' }}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-2xl
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-white/20'}
                  `}
                >
                  {item.icon || rankEmojis[index]}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold truncate ${index === 0 ? 'text-xl text-yellow-100' : 'text-lg text-white'}`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm">{item.value}</p>
                </div>

                <div
                  className={`
                    text-2xl font-black
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
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <p className="text-white/40 text-sm font-medium tracking-wider">MEDCOF</p>
      </motion.div>
    </div>
  );
}

