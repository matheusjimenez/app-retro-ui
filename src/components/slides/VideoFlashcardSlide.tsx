'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface VideoFlashcardSlideProps {
  flashcards: {
    total: number;
    scoreDistribution: {
      naoLembrei: number;
      dificil: number;
      bom: number;
      facil: number;
    };
  };
  videos: {
    watched: number;
    finished: number;
    totalHoursWatched: number;
    peakDay?: {
      date: string;
      hours: number;
    };
  };
  totalStudyHours: number;
}

export default function VideoFlashcardSlide({
  flashcards,
  videos,
  totalStudyHours,
}: VideoFlashcardSlideProps) {
  // Formata a data do dia de pico
  const formatPeakDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateStr;
    }
  };

  // Calcula porcentagem de cada score de flashcard
  const getScorePercentage = (score: number) => {
    if (flashcards.total === 0) return 0;
    return Math.round((score / flashcards.total) * 100);
  };

  const scoreColors = {
    facil: { bg: 'bg-emerald-500', text: 'text-emerald-400' },
    bom: { bg: 'bg-cyan-500', text: 'text-cyan-400' },
    dificil: { bg: 'bg-amber-500', text: 'text-amber-400' },
    naoLembrei: { bg: 'bg-rose-500', text: 'text-rose-400' },
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-rose-900 via-pink-900 to-fuchsia-900 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-white/5 blur-3xl"
          style={{ top: '-10%', right: '-10%' }}
        />
        <div 
          className="absolute w-48 sm:w-72 h-48 sm:h-72 rounded-full bg-white/5 blur-3xl"
          style={{ bottom: '10%', left: '-10%' }}
        />
        {/* Decorative elements */}
        <div className="absolute top-20 left-8 text-4xl opacity-10">🎬</div>
        <div className="absolute bottom-32 right-8 text-4xl opacity-10">🧠</div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 pt-10 sm:pt-12">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl font-black text-white text-center mb-4 sm:mb-6"
          style={{ fontFamily: 'Clash Display, sans-serif' }}
        >
          Seus Estudos em 2025
        </motion.h2>

        {/* Main Stats Grid */}
        <div className="w-full max-w-sm space-y-3 sm:space-y-4">
          {/* Total Study Hours - Hero stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Tempo Total de Estudo
                </p>
                <p
                  className="text-3xl sm:text-4xl font-black text-white mt-1"
                  style={{ fontFamily: 'Clash Display, sans-serif' }}
                >
                  {totalStudyHours.toLocaleString('pt-BR')}h
                </p>
              </div>
              <div className="text-4xl sm:text-5xl">⏱️</div>
            </div>
          </motion.div>

          {/* Video Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                🎬
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  Aulas Assistidas
                </p>
                <div className="flex items-baseline gap-2">
                  <p
                    className="text-xl sm:text-2xl font-black text-white"
                    style={{ fontFamily: 'Clash Display, sans-serif' }}
                  >
                    {videos.totalHoursWatched.toLocaleString('pt-BR')}h
                  </p>
                  <p className="text-white/50 text-xs sm:text-sm">
                    ({videos.watched} vídeos)
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Peak Day */}
          {videos.peakDay && videos.peakDay.hours > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                  🏆
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                    Dia mais produtivo
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p
                      className="text-xl sm:text-2xl font-black text-white"
                      style={{ fontFamily: 'Clash Display, sans-serif' }}
                    >
                      {videos.peakDay.hours.toFixed(1)}h
                    </p>
                    <p className="text-white/50 text-xs sm:text-sm">
                      em {formatPeakDate(videos.peakDay.date)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Flashcards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-xl sm:text-2xl shadow-lg">
                🧠
              </div>
              <div>
                <p className="text-white/60 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  Flashcards Revisados
                </p>
                <p
                  className="text-lg sm:text-xl font-black text-white"
                  style={{ fontFamily: 'Clash Display, sans-serif' }}
                >
                  {flashcards.total.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Score Distribution Bar */}
            {flashcards.total > 0 && (
              <div className="space-y-2">
                <div className="h-3 sm:h-4 rounded-full overflow-hidden flex bg-white/10">
                  {flashcards.scoreDistribution.facil > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getScorePercentage(flashcards.scoreDistribution.facil)}%` }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className={`${scoreColors.facil.bg} h-full`}
                    />
                  )}
                  {flashcards.scoreDistribution.bom > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getScorePercentage(flashcards.scoreDistribution.bom)}%` }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className={`${scoreColors.bom.bg} h-full`}
                    />
                  )}
                  {flashcards.scoreDistribution.dificil > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getScorePercentage(flashcards.scoreDistribution.dificil)}%` }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className={`${scoreColors.dificil.bg} h-full`}
                    />
                  )}
                  {flashcards.scoreDistribution.naoLembrei > 0 && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getScorePercentage(flashcards.scoreDistribution.naoLembrei)}%` }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className={`${scoreColors.naoLembrei.bg} h-full`}
                    />
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[8px] sm:text-[10px]">
                  <span className={`${scoreColors.facil.text} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${scoreColors.facil.bg}`} />
                    Fácil {getScorePercentage(flashcards.scoreDistribution.facil)}%
                  </span>
                  <span className={`${scoreColors.bom.text} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${scoreColors.bom.bg}`} />
                    Bom {getScorePercentage(flashcards.scoreDistribution.bom)}%
                  </span>
                  <span className={`${scoreColors.dificil.text} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${scoreColors.dificil.bg}`} />
                    Difícil {getScorePercentage(flashcards.scoreDistribution.dificil)}%
                  </span>
                  <span className={`${scoreColors.naoLembrei.text} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${scoreColors.naoLembrei.bg}`} />
                    Não lembrei {getScorePercentage(flashcards.scoreDistribution.naoLembrei)}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-auto pt-4"
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

