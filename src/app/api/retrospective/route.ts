import { NextRequest, NextResponse } from 'next/server';
import { fetchAllStats, decodeJWT } from '@/lib/api-client';

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

    // Busca todas as estatísticas
    const stats = await fetchAllStats(token);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        year: 2025,
        userName: userData.name || userData.anonName || 'Estudante',
        userPhoto: userData.photo,
        userEmail: userData.email,
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
  };
}
