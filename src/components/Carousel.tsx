'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
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

  const slides = [
    // Slide 1: Intro
    <IntroSlide key="intro" year={data.year} userName={data.userName} />,

    // Slide 2: Study Stats
    <StatsSlide
      key="stats"
      title="Seu esforço em números"
      gradient="from-violet-900 via-purple-900 to-indigo-900"
      stats={[
        {
          label: 'Horas de Estudo',
          value: Math.round(data.studyTime.totalHours),
          icon: '⏱️',
          description: `Média de ${data.studyTime.averageHoursPerDay.toFixed(1)}h por dia`,
        },
        {
          label: 'Questões Resolvidas',
          value: data.questions.total,
          icon: '📝',
          description: `${data.questions.correct.toLocaleString('pt-BR')} acertos`,
        },
        {
          label: 'Taxa de Acerto',
          value: `${data.questions.accuracyRate.toFixed(0)}%`,
          icon: '🎯',
          description: data.questions.accuracyRate >= 70 ? 'Excelente!' : 'Continue praticando!',
        },
      ]}
    />,

    // Slide 3: Flashcards & Videos
    <StatsSlide
      key="flashvideo"
      title="Mais conquistas"
      gradient="from-blue-900 via-cyan-900 to-teal-900"
      stats={[
        {
          label: 'Flashcards Revisados',
          value: data.flashcards.total,
          icon: '🃏',
          description: `${data.flashcards.scoreDistribution.facil + data.flashcards.scoreDistribution.bom} marcados como "fácil" ou "bom"`,
        },
        {
          label: 'Aulas Assistidas',
          value: data.videos.watched,
          icon: '🎬',
          description: `${data.videos.finished} finalizadas`,
        },
        {
          label: 'Tempo em Vídeos',
          value: `${Math.round(data.videos.totalHoursWatched)}h`,
          icon: '📺',
          description: 'De conhecimento puro',
        },
      ]}
    />,

    // Slide 4: Top Specialties
    <TopListSlide
      key="toplist"
      title="Top 5 Especialidades"
      subtitle="Onde você mais focou este ano"
      items={data.topSpecialties.map((s) => ({
        rank: s.rank,
        title: s.title,
        value: s.value,
        icon: s.icon,
      }))}
      gradient="from-emerald-900 via-green-900 to-teal-900"
    />,

    // Slide 5: Personality
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
    <div className="w-full max-w-lg mx-auto">
      {/* Carousel container */}
      <div className="relative">
        {/* Slides */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div
                ref={(el) => {
                  slideRefs.current[currentSlide] = el;
                }}
                className="aspect-[9/16] w-full"
              >
                {slides[currentSlide]}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all ${
              currentSlide === 0
                ? 'opacity-30 cursor-not-allowed'
                : 'opacity-70 hover:opacity-100 hover:scale-110'
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all ${
              currentSlide === slides.length - 1
                ? 'opacity-30 cursor-not-allowed'
                : 'opacity-70 hover:opacity-100 hover:scale-110'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 w-6'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex gap-3 mt-6 justify-center">
        <button
          onClick={exportCurrentSlide}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          {isExporting ? 'Exportando...' : 'Baixar Slide'}
        </button>

        <button
          onClick={exportAllSlides}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium transition-all hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 className="w-5 h-5" />
          Baixar Tudo
        </button>
      </div>

      <p className="text-center text-white/50 text-sm mt-4">
        📱 Imagens otimizadas para Instagram Stories (1080x1920)
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

