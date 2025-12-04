import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getStudentStatistics } from '@/lib/statistics';

// GET - Fetch retrospective stats for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const demo = searchParams.get('demo');

    // Return demo data for testing
    if (demo === 'true') {
      return NextResponse.json({
        success: true,
        data: getDemoStatistics(),
      });
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const statistics = await getStudentStatistics(
      parseInt(userId),
      parseInt(year)
    );

    return NextResponse.json({ success: true, data: statistics });
  } catch (error) {
    console.error('Error fetching retrospective:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDemoStatistics() {
  return {
    userId: 1,
    year: 2024,
    userName: 'Estudante Medcof',
    questions: {
      total: 12847,
      correct: 10021,
      accuracyRate: 78.0,
    },
    flashcards: {
      total: 4523,
      scoreDistribution: {
        naoLembrei: 452,
        dificil: 1130,
        bom: 1808,
        facil: 1133,
      },
    },
    videos: {
      watched: 342,
      finished: 298,
      totalSecondsWatched: 184320,
      totalHoursWatched: 51.2,
    },
    studyTime: {
      totalSeconds: 665520,
      totalHours: 184.87,
      averageSecondsPerDay: 2318,
      averageHoursPerDay: 0.64,
    },
    topSpecialties: [
      { rank: 1, title: 'Cardiologia', hours: 234, value: '234 horas', icon: '❤️' },
      { rank: 2, title: 'Clínica Médica', hours: 189, value: '189 horas', icon: '🩺' },
      { rank: 3, title: 'Cirurgia', hours: 156, value: '156 horas', icon: '🔪' },
      { rank: 4, title: 'Pediatria', hours: 134, value: '134 horas', icon: '👶' },
      { rank: 5, title: 'Ginecologia', hours: 98, value: '98 horas', icon: '🌸' },
    ],
    personality: {
      type: 'O Estrategista',
      description:
        'Você planeja cada passo com cuidado e executa com precisão. Sua dedicação ao estudo é admirável!',
    },
    funFact:
      'Você estudou mais às 23h do que em qualquer outro horário. Coruja noturna! 🦉',
    studyStreak: 45,
    peakStudyHour: 23,
    daysStudied: 287,
  };
}
