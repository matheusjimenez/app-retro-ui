'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Carousel from '@/components/Carousel';

interface RetrospectiveData {
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
    totalSecondsWatched: number;
    totalHoursWatched: number;
  };
  studyTime: {
    totalSeconds: number;
    totalHours: number;
    averageSecondsPerDay: number;
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
}

export default function HomePage() {
  const [data, setData] = useState<RetrospectiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [showForm, setShowForm] = useState(true);
  const [useDemo, setUseDemo] = useState(false);

  const fetchData = async (id?: string, demo = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = demo
        ? '/api/retrospective?demo=true'
        : `/api/retrospective?userId=${id}&year=2024`;

      const response = await fetch(url);
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
    if (userId.trim()) {
      fetchData(userId, false);
    }
  };

  const handleDemoMode = () => {
    setUseDemo(true);
    fetchData(undefined, true);
  };

  const handleReset = () => {
    setData(null);
    setShowForm(true);
    setUserId('');
    setUseDemo(false);
  };

  // Auto-load demo on first visit for demonstration
  useEffect(() => {
    // Check URL params for userId
    const params = new URLSearchParams(window.location.search);
    const urlUserId = params.get('userId');
    const demoParam = params.get('demo');

    if (demoParam === 'true') {
      handleDemoMode();
    } else if (urlUserId) {
      setUserId(urlUserId);
      fetchData(urlUserId, false);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <main className="min-h-screen animated-gradient py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1
            className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            style={{ fontFamily: 'Clash Display, sans-serif' }}
          >
            Retrospectiva 2024
          </h1>
          <p className="text-white/60">Sua jornada de estudos em medicina</p>
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
                  Insira seu ID de usuário para ver suas estatísticas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="userId" className="block text-white/80 text-sm mb-2">
                    ID do Usuário
                  </label>
                  <input
                    type="text"
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Ex: 12345"
                    className="input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!userId.trim()}
                  className="btn-primary w-full"
                >
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
          >
            {/* Reset button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleReset}
                className="text-white/50 hover:text-white/80 text-sm flex items-center gap-2 transition-colors"
              >
                ← Voltar ao início
              </button>
            </div>

            {/* Carousel */}
            <Carousel data={data} />

            {/* Info */}
            {useDemo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <div className="inline-block bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-2">
                  <p className="text-yellow-200 text-sm">
                    📌 Modo demonstração - dados fictícios
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : null}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 pb-8"
        >
          <p className="text-white/30 text-sm">
            Feito com 💜 por{' '}
            <span className="text-white/50 font-medium">Medcof</span>
          </p>
        </motion.footer>
      </div>
    </main>
  );
}
