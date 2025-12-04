import { NextRequest, NextResponse } from 'next/server';
import { fetchAllStats, decodeJWT } from '@/lib/api-client';
import { getAllStudyStats } from '@/lib/mongodb-queries';

// GET - Fetch retrospective stats usando o JWT
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get('demo');

    // Return demo data for testing
    if (demo === 'true') {
      return NextResponse.json({
        success: true,
        data: getDemoStatistics(),
      });
    }

    // Pega o token do header Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token JWT é obrigatório' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Decodifica o JWT para pegar dados do usuário
    const userData = decodeJWT(token);
    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'Token JWT inválido' },
        { status: 401 }
      );
    }

    // Busca estatísticas de questões da API externa
    const stats = await fetchAllStats(token);

    // Estima tempo de questões (2 min por questão em média)
    const estimatedQuestionTimeSeconds = stats.questionsTotal * 120;

    // Busca estatísticas de flashcards e vídeos do MongoDB
    let mongoStats: {
      flashcards: { total: number; scoreDistribution: { naoLembrei: number; dificil: number; bom: number; facil: number } };
      videos: { watched: number; finished: number; totalSecondsWatched: number; totalHoursWatched: number; peakDay?: { date: string; hours: number } };
      totalStudyHours: number;
    } = {
      flashcards: {
        total: 0,
        scoreDistribution: { naoLembrei: 0, dificil: 0, bom: 0, facil: 0 },
      },
      videos: {
        watched: 0,
        finished: 0,
        totalSecondsWatched: 0,
        totalHoursWatched: 0,
      },
      totalStudyHours: Math.round(estimatedQuestionTimeSeconds / 3600),
    };

    try {
      mongoStats = await getAllStudyStats(userData.id, estimatedQuestionTimeSeconds);
    } catch (mongoError) {
      console.warn('Erro ao buscar dados do MongoDB, usando valores padrão:', mongoError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        year: 2025,
        userName: userData.name || userData.anonName || 'Estudante',
        userPhoto: userData.photo,
        userEmail: userData.email,
        // Dados do MongoDB
        flashcardsTotal: mongoStats.flashcards.total,
        flashcardsScoreDistribution: mongoStats.flashcards.scoreDistribution,
        videosWatched: mongoStats.videos.watched,
        videosFinished: mongoStats.videos.finished,
        videosTotalHoursWatched: mongoStats.videos.totalHoursWatched,
        videosPeakDay: mongoStats.videos.peakDay,
        totalStudyHours: mongoStats.totalStudyHours,
      },
    });
  } catch (error) {
    console.error('Error fetching retrospective:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    // Verifica se é erro de autenticação
    if (errorMessage.includes('401') || errorMessage.includes('Invalid authorization')) {
      return NextResponse.json(
        { success: false, error: 'Token expirado ou inválido. Faça login novamente.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

function getDemoStatistics() {
  return {
    year: 2025,
    userName: 'Estudante Medcof',
    questionsTotal: 12847,
    questionsCorrect: 10021,
    questionsWrong: 2826,
    accuracyRate: 78.0,
    hardestQuestionsCount: 342,
    dailyQuestions: [
      { date: '2025-01-15', total: 45, correct: 36, wrong: 9 },
      { date: '2025-01-16', total: 52, correct: 41, wrong: 11 },
      { date: '2025-01-17', total: 38, correct: 30, wrong: 8 },
    ],
    accuracyEvolution: [
      { date: '2025-01-01', accuracyRate: 65, totalAnswered: 100, totalCorrect: 65 },
      { date: '2025-06-01', accuracyRate: 72, totalAnswered: 5000, totalCorrect: 3600 },
      { date: '2025-12-01', accuracyRate: 78, totalAnswered: 12847, totalCorrect: 10021 },
    ],
    totalDaysStudied: 287,
    bestStreak: 45,
    peakStudyHour: 23,
    averageQuestionsPerDay: 45,
    dailyRecord: 156,
    dailyRecordDate: '2025-08-15',
    bestMonth: 'Agosto',
    bestMonthCount: 2847,
    bySpecialty: [
      { rank: 1, title: 'Clínica Médica', total: 3200, correct: 2560, value: '3.200 questões' },
      { rank: 2, title: 'Cirurgia', total: 2800, correct: 2100, value: '2.800 questões' },
      { rank: 3, title: 'Pediatria', total: 2100, correct: 1680, value: '2.100 questões' },
      { rank: 4, title: 'Ginecologia', total: 1800, correct: 1440, value: '1.800 questões' },
      { rank: 5, title: 'Preventiva', total: 1500, correct: 1200, value: '1.500 questões' },
    ],
    personality: {
      type: 'O Estrategista',
      description:
        'Você planeja cada passo com cuidado e executa com precisão. Sua dedicação ao estudo é admirável!',
    },
    funFact:
      'Você resolveu 12.847 questões! Isso daria um livro de 1.285 páginas! 📚',
    // Flashcards stats (baseado no MongoDB guide)
    flashcardsTotal: 4532,
    flashcardsScoreDistribution: {
      naoLembrei: 453,   // ~10% - Score 0
      dificil: 906,      // ~20% - Score 1
      bom: 1813,         // ~40% - Score 2
      facil: 1360,       // ~30% - Score 3
    },
    // Videos stats (baseado no MongoDB guide - video_daily_tracker)
    videosWatched: 347,
    videosFinished: 298,
    videosTotalHoursWatched: 186,
    videosPeakDay: {
      date: '2025-09-22',
      hours: 8.5,
    },
    // Total study time (questions ~2min each + flashcards ~30s each + videos)
    // Questões: 12847 * 2min = 428h, Flashcards: 4532 * 0.5min = 38h, Vídeos: 186h
    totalStudyHours: 652,
  };
}
