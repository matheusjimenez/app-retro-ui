'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';

import IntroSlide from './slides/IntroSlide';
import StatsSlide from './slides/StatsSlide';
import TopListSlide from './slides/TopListSlide';
import PersonalitySlide from './slides/PersonalitySlide';
import SummarySlide from './slides/SummarySlide';

interface CarouselProps {
  data: {
    year: number;
    userName?: string;
    questions: {
      total: number;
      correct: number;
      accuracyRate: number;
    };
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
    };
    studyTime: {
      totalHours: number;
      averageHoursPerDay: number;
    };
    topSpecialties: Array<{
      rank: number;
      title: string;
      value: string;
      hours: number;
      icon?: string;
    }>;
    personality: {
      type: string;
      description: string;
    };
    funFact: string;
    studyStreak: number;
    daysStudied?: number;
  };
}

export default function Carousel({ data }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Calcula questões erradas
  const questionsWrong = data.questions.total - data.questions.correct;

  const slides = [
    // Slide 1: Intro
    <IntroSlide key="intro" year={data.year} userName={data.userName} />,

    // Slide 2: Questões Stats
    <StatsSlide
      key="stats"
      title="Suas questões em 2025"
      gradient="from-violet-900 via-purple-900 to-indigo-900"
      stats={[
        {
          label: 'Questões Resolvidas',
          value: data.questions.total,
          icon: '📝',
          description: 'No ano inteiro',
        },
        {
          label: 'Acertos',
          value: data.questions.correct,
          icon: '✅',
          description: `${questionsWrong.toLocaleString('pt-BR')} erros`,
        },
        {
          label: 'Taxa de Acerto',
          value: `${data.questions.accuracyRate.toFixed(0)}%`,
          icon: '🎯',
          description: data.questions.accuracyRate >= 70 ? 'Excelente!' : 'Continue praticando!',
        },
      ]}
    />,

    // Slide 3: Mais métricas
    <StatsSlide
      key="metrics"
      title="Sua dedicação"
      gradient="from-blue-900 via-cyan-900 to-teal-900"
      stats={[
        {
          label: 'Dias de Estudo',
          value: data.daysStudied || 0,
          icon: '📅',
          description: 'Dias com questões resolvidas',
        },
        {
          label: 'Maior Sequência',
          value: `${data.studyStreak} dias`,
          icon: '🔥',
          description: 'Consecutivos estudando',
        },
        {
          label: 'Média Diária',
          value: Math.round(data.questions.total / (data.daysStudied || 1)),
          icon: '📊',
          description: 'Questões por dia ativo',
        },
      ]}
    />,

    // Slide 4: Top Especialidades
    <TopListSlide
      key="toplist"
      title="Top 5 Especialidades"
      subtitle="Onde você mais praticou"
      items={data.topSpecialties.map((s) => ({
        rank: s.rank,
        title: s.title,
        value: s.value,
        icon: s.icon,
      }))}
      gradient="from-emerald-900 via-green-900 to-teal-900"
    />,

    // Slide 5: Personalidade
    <PersonalitySlide
      key="personality"
      personality={data.personality}
      funFact={data.funFact}
    />,

    // Slide 6: Summary
    <SummarySlide
      key="summary"
      year={data.year}
      totalHours={data.studyTime.totalHours}
      questionsTotal={data.questions.total}
      accuracyRate={data.questions.accuracyRate}
      studyStreak={data.studyStreak}
      userName={data.userName}
    />,
  ];

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  const nextSlide = () => goToSlide(currentSlide + 1);
  const prevSlide = () => goToSlide(currentSlide - 1);

  // Export current slide as image for Instagram Story (1080x1920)
  const exportCurrentSlide = useCallback(async () => {
    const slideElement = slideRefs.current[currentSlide];
    if (!slideElement || isExporting) return;

    setIsExporting(true);

    try {
      const dataUrl = await toPng(slideElement, {
        width: 1080,
        height: 1920,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `retrospectiva-${data.year}-slide-${currentSlide + 1}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting slide:', error);
      alert('Erro ao exportar imagem. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  }, [currentSlide, data.year, isExporting]);

  // Export all slides
  const exportAllSlides = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      for (let i = 0; i < slides.length; i++) {
        const slideElement = slideRefs.current[i];
        if (!slideElement) continue;

        // Small delay to ensure animations are complete
        await new Promise((resolve) => setTimeout(resolve, 300));

        const dataUrl = await toPng(slideElement, {
          width: 1080,
          height: 1920,
          pixelRatio: 2,
        });

        const link = document.createElement('a');
        link.download = `retrospectiva-${data.year}-slide-${i + 1}.png`;
        link.href = dataUrl;
        link.click();

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error exporting slides:', error);
      alert('Erro ao exportar imagens. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  }, [data.year, isExporting, slides.length]);

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-4">
      {/* Carousel container */}
      <div className="relative">
        {/* Slides - responsive height */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
          style={{ height: 'min(75vh, 600px)', minHeight: '400px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <div
                ref={(el) => {
                  slideRefs.current[currentSlide] = el;
                }}
                className="h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden"
              >
                {slides[currentSlide]}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Instagram-style tap navigation zones */}
          <div className="absolute inset-0 flex z-10">
            {/* Left tap zone - go back */}
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="w-1/3 h-full cursor-pointer focus:outline-none active:bg-black/5 transition-colors"
              aria-label="Slide anterior"
            />
            {/* Center zone - no action */}
            <div className="w-1/3 h-full" />
            {/* Right tap zone - go forward */}
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="w-1/3 h-full cursor-pointer focus:outline-none active:bg-black/5 transition-colors"
              aria-label="Próximo slide"
            />
          </div>

          {/* Progress bar at top (Instagram style) */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 flex gap-1 z-20">
            {slides.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-0.5 sm:h-1 rounded-full bg-white/30 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-white"
                  initial={false}
                  animate={{
                    width: index < currentSlide ? '100%' : index === currentSlide ? '100%' : '0%',
                  }}
                  transition={{ duration: index === currentSlide ? 0.3 : 0 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export buttons - responsive */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 px-2">
        <button
          onClick={exportCurrentSlide}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium text-sm sm:text-base transition-all active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          {isExporting ? 'Exportando...' : 'Baixar Slide'}
        </button>

        <button
          onClick={exportAllSlides}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium text-sm sm:text-base transition-all active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          Baixar Tudo
        </button>
      </div>

      <p className="text-center text-white/40 text-xs sm:text-sm mt-3 sm:mt-4">
        📱 Otimizado para Instagram Stories
      </p>

      {/* Hidden slides for export */}
      <div className="fixed -left-[9999px] top-0">
        {slides.map((slide, index) => (
          <div
            key={`export-${index}`}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className="w-[1080px] h-[1920px]"
            style={{ width: '1080px', height: '1920px' }}
          >
            {slide}
          </div>
        ))}
      </div>
    </div>
  );
}
