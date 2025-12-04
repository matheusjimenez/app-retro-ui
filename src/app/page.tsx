'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Carousel from '@/components/Carousel';

interface RetrospectiveData {
  year: number;
  userName?: string;
  userPhoto?: string;
  questionsTotal: number;
  questionsCorrect: number;
  questionsWrong: number;
  accuracyRate: number;
  hardestQuestionsCount: number;
  dailyQuestions: Array<{
    date: string;
    total: number;
    correct: number;
    wrong: number;
  }>;
  accuracyEvolution: Array<{
    date: string;
    accuracyRate: number;
    totalAnswered: number;
    totalCorrect: number;
  }>;
  totalDaysStudied: number;
  bestStreak: number;
  peakStudyHour: number;
  averageQuestionsPerDay: number;
  dailyRecord: number;
  dailyRecordDate: string;
  bestMonth: string;
  bestMonthCount: number;
  bySpecialty: Array<{
    rank: number;
    title: string;
    total: number;
    correct: number;
    value: string;
  }>;
  personality: {
    type: string;
    description: string;
  };
  funFact: string;
  // Novos campos do MongoDB
  flashcardsTotal?: number;
  flashcardsScoreDistribution?: {
    naoLembrei: number;
    dificil: number;
    bom: number;
    facil: number;
  };
  videosWatched?: number;
  videosFinished?: number;
  videosTotalHoursWatched?: number;
  videosPeakDay?: {
    date: string;
    hours: number;
  };
  totalStudyHours?: number;
}

// Transforma dados da API para o formato do Carousel
function transformDataForCarousel(data: RetrospectiveData) {
  // Calcula horas de estudo (usa o valor do MongoDB se disponível, senão estima)
  const totalStudyHours = data.totalStudyHours ?? Math.round(data.questionsTotal * 2 / 60);
  
  return {
    year: data.year,
    userName: data.userName,
    questions: {
      total: data.questionsTotal,
      correct: data.questionsCorrect,
      wrong: data.questionsWrong,
      accuracyRate: data.accuracyRate,
      hardestCount: data.hardestQuestionsCount,
      averagePerDay: data.averageQuestionsPerDay,
      dailyRecord: data.dailyRecord,
      dailyRecordDate: data.dailyRecordDate,
      bestMonth: data.bestMonth,
      bestMonthCount: data.bestMonthCount,
    },
    flashcards: {
      total: data.flashcardsTotal ?? 0,
      scoreDistribution: data.flashcardsScoreDistribution ?? {
        naoLembrei: 0,
        dificil: 0,
        bom: 0,
        facil: 0,
      },
    },
    videos: {
      watched: data.videosWatched ?? 0,
      finished: data.videosFinished ?? 0,
      totalHoursWatched: data.videosTotalHoursWatched ?? 0,
      peakDay: data.videosPeakDay,
    },
    studyTime: {
      totalHours: totalStudyHours,
      averageHoursPerDay: data.totalDaysStudied > 0 
        ? Number((totalStudyHours / data.totalDaysStudied).toFixed(1))
        : data.averageQuestionsPerDay * 2 / 60,
    },
    topSpecialties: data.bySpecialty.map((s) => ({
      rank: s.rank,
      title: s.title,
      value: s.value,
      hours: s.total,
      icon: getSpecialtyIcon(s.title),
    })),
    personality: data.personality,
    funFact: data.funFact,
    studyStreak: data.bestStreak,
    daysStudied: data.totalDaysStudied,
  };
}

function getSpecialtyIcon(title: string): string {
  const icons: Record<string, string> = {
    'Clínica Médica': '🩺',
    'Cirurgia': '🔪',
    'Pediatria': '👶',
    'Ginecologia': '🌸',
    'Obstetrícia': '🤰',
    'Preventiva': '🛡️',
    'Cardiologia': '❤️',
    'Neurologia': '🧠',
    'Ortopedia': '🦴',
    'Psiquiatria': '🧘',
  };
  return icons[title] || '📚';
}

export default function HomePage() {
  const [data, setData] = useState<RetrospectiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [showToken, setShowToken] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const fetchData = async (jwt?: string, demo = false) => {
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (!demo && jwt) {
        headers['Authorization'] = `Bearer ${jwt}`;
      }

      const url = demo ? '/api/retrospective?demo=true' : '/api/retrospective';

      const response = await fetch(url, { headers });
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setShowForm(false);
      } else {
        setError(result.error || 'Erro ao carregar dados');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      fetchData(token, false);
    }
  };

  const handleDemoMode = () => {
    fetchData(undefined, true);
  };

  const handleReset = () => {
    setData(null);
    setShowForm(true);
    setError(null);
  };

  // Verifica se há token na URL (útil para integração)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demoParam = params.get('demo');

    if (demoParam === 'true') {
      handleDemoMode();
    }
  }, []);

  return (
    <main className="min-h-screen min-h-[100dvh] animated-gradient py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            Retrospectiva 2025
          </h1>
          <p className="text-white/60 text-sm sm:text-base">Sua jornada de estudos na MED</p>
        </motion.header>

        {/* Form or Carousel */}
        {showForm && !loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Veja sua Retrospectiva
                </h2>
                <p className="text-white/60 text-sm">
                  Insira seu token JWT para ver suas estatísticas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="token" className="block text-white/80 text-sm mb-2">
                    Token JWT
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      id="token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIs..."
                      className="input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-white/40 text-xs mt-2">
                    💡 Você pode obter seu token fazendo login na plataforma
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!token.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <LogIn size={20} />
                  Ver Retrospectiva
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/40 text-sm text-center mb-4">
                  Ou veja uma demonstração
                </p>
                <button
                  onClick={handleDemoMode}
                  className="btn-secondary w-full"
                >
                  🎯 Ver Demo
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </div>

            {/* Instruções */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>🔑</span> Como obter seu token?
              </h3>
              <ol className="text-white/60 text-sm space-y-2">
                <li>1. Faça login no QBank</li>
                <li>2. Abra as ferramentas de desenvolvedor (F12)</li>
                <li>3. Vá na aba Network e faça qualquer requisição</li>
                <li>4. Copie o valor do header &quot;Authorization&quot;</li>
                <li>5. Cole aqui (sem o &quot;Bearer &quot;)</li>
              </ol>
            </motion.div>
          </motion.div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="spinner mb-4"></div>
            <p className="text-white/60">Carregando sua retrospectiva...</p>
          </div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-full"
          >
            {/* Reset button - fixed at top on mobile */}
            <div className="flex justify-center mb-3 sm:mb-6">
              <button
                onClick={handleReset}
                className="text-white/50 hover:text-white/80 active:text-white text-xs sm:text-sm flex items-center gap-1 sm:gap-2 transition-colors py-2 px-3 -my-2 -mx-3"
              >
                ← Voltar ao início
              </button>
            </div>

            {/* Carousel */}
            <Carousel data={transformDataForCarousel(data)} />
          </motion.div>
        ) : null}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6 sm:mt-12 pb-4 sm:pb-8"
        >
          <p className="text-white/30 text-xs sm:text-sm">
            Feito com 💜 por{' '}
            <span className="text-white/50 font-medium">Medcof</span>
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
