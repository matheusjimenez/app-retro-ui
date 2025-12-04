import {
  DailyAnsweredResponse,
  AnsweredQuestionsResponse,
  EverAnsweredWrongResponse,
  RightAnswersEvolutionResponse,
  RetrospectiveStats,
  JWTUserData,
} from '@/types/api';

const BASE_URL = 'https://qbank-api.medcof.tech/v3';

// Período fixo: 1 de janeiro a 31 de dezembro de 2025
const START_DATE = '2025-01-01';
const END_DATE = '2025-12-31';

async function fetchWithAuth<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Decodifica o JWT para extrair dados do usuário
export function decodeJWT(token: string): JWTUserData | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Busca questões respondidas diariamente
export async function fetchDailyAnswered(token: string): Promise<DailyAnsweredResponse> {
  const url = `${BASE_URL}/reports/questions/answered/daily?startAt=${START_DATE}&endAt=${END_DATE}`;
  return fetchWithAuth<DailyAnsweredResponse>(url, token);
}

// Busca resumo total de questões respondidas
export async function fetchAnsweredQuestions(token: string): Promise<AnsweredQuestionsResponse> {
  const url = `${BASE_URL}/reports/questions/answered?startAt=${START_DATE}&endAt=${END_DATE}`;
  return fetchWithAuth<AnsweredQuestionsResponse>(url, token);
}

// Busca questões que mais errou
export async function fetchEverAnsweredWrong(token: string): Promise<EverAnsweredWrongResponse> {
  const url = `${BASE_URL}/reports/questions/ever-answered-wrong?startAt=${START_DATE}&endAt=${END_DATE}`;
  return fetchWithAuth<EverAnsweredWrongResponse>(url, token);
}

// Busca evolução da taxa de acerto
export async function fetchRightAnswersEvolution(token: string): Promise<RightAnswersEvolutionResponse> {
  const url = `${BASE_URL}/reports/graph/right-answers-evolution?startAt=${START_DATE}&endAt=${END_DATE}`;
  return fetchWithAuth<RightAnswersEvolutionResponse>(url, token);
}

// Calcula a maior sequência de dias estudando
function calculateStreak(dailyData: Array<{ date: string }>): number {
  if (dailyData.length === 0) return 0;

  const sortedDates = dailyData
    .map((d) => d.date)
    .sort();

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

// Determina personalidade baseada nos hábitos de estudo
function determinePersonality(stats: {
  questionsTotal: number;
  accuracyRate: number;
  streak: number;
  totalDays: number;
  averagePerDay: number;
}): { type: string; description: string } {
  const { questionsTotal, accuracyRate, streak, totalDays, averagePerDay } = stats;

  if (streak >= 30 && accuracyRate >= 80) {
    return {
      type: 'O Estrategista',
      description:
        'Você planeja cada passo com cuidado e executa com precisão. Sua dedicação e consistência são admiráveis!',
    };
  }

  if (questionsTotal > 5000 && accuracyRate >= 75) {
    return {
      type: 'O Maratonista',
      description:
        'Você não para até dominar o assunto. Sua resistência e foco são invejáveis!',
    };
  }

  if (questionsTotal > 3000 && totalDays > 200) {
    return {
      type: 'O Consistente',
      description:
        'Dia após dia, você mantém o ritmo. Consistência é sua maior virtude!',
    };
  }

  if (averagePerDay > 50) {
    return {
      type: 'O Intenso',
      description:
        'Quando você estuda, é pra valer! Sessões intensas são sua marca registrada.',
    };
  }

  if (accuracyRate >= 85) {
    return {
      type: 'O Preciso',
      description:
        'Qualidade sobre quantidade. Você acerta mais do que a maioria!',
    };
  }

  if (totalDays > 150) {
    return {
      type: 'O Dedicado',
      description:
        'Presente quase todos os dias. Sua dedicação vai te levar longe!',
    };
  }

  return {
    type: 'O Equilibrado',
    description:
      'Você mantém um ritmo saudável de estudos. Balance é a chave do sucesso!',
  };
}

// Gera fun fact baseado nos dados
function generateFunFact(stats: {
  questionsTotal: number;
  accuracyRate: number;
  streak: number;
  totalDays: number;
  hardestCount: number;
}): string {
  const funFacts = [];

  if (stats.questionsTotal >= 10000) {
    funFacts.push(
      `Você resolveu ${stats.questionsTotal.toLocaleString('pt-BR')} questões! Isso daria um livro de ${Math.round(stats.questionsTotal / 10)} páginas! 📚`
    );
  } else if (stats.questionsTotal >= 5000) {
    funFacts.push(
      `${stats.questionsTotal.toLocaleString('pt-BR')} questões resolvidas! Você está no caminho certo! 💪`
    );
  } else if (stats.questionsTotal >= 1000) {
    funFacts.push(
      `Mais de ${stats.questionsTotal.toLocaleString('pt-BR')} questões no ano. Cada uma te deixa mais preparado! 📝`
    );
  }

  if (stats.streak >= 30) {
    funFacts.push(
      `Sua maior sequência foi de ${stats.streak} dias seguidos. Consistência nível hard! 🔥`
    );
  } else if (stats.streak >= 14) {
    funFacts.push(
      `${stats.streak} dias seguidos de estudo! Você é disciplinado! 💪`
    );
  }

  if (stats.accuracyRate >= 85) {
    funFacts.push(
      `Taxa de acerto de ${stats.accuracyRate.toFixed(0)}%! Você está entre os melhores! 🎯`
    );
  } else if (stats.accuracyRate >= 70) {
    funFacts.push(
      `${stats.accuracyRate.toFixed(0)}% de acerto. Acima da média! Continue assim! ⭐`
    );
  }

  if (stats.totalDays >= 300) {
    funFacts.push(
      `Você estudou em ${stats.totalDays} dias diferentes. Praticamente o ano inteiro! 📅`
    );
  } else if (stats.totalDays >= 200) {
    funFacts.push(
      `${stats.totalDays} dias de estudo no ano. Mais da metade do ano dedicado! 🗓️`
    );
  }

  if (stats.hardestCount > 100) {
    funFacts.push(
      `Você enfrentou ${stats.hardestCount} questões difíceis. Desafios te fortalecem! 💎`
    );
  }

  return funFacts[Math.floor(Math.random() * funFacts.length)] || 
    'Você está no caminho certo! Continue assim! 💪';
}

// Busca todas as estatísticas e monta o objeto consolidado
export async function fetchAllStats(token: string): Promise<RetrospectiveStats> {
  console.log('Fetching all stats...');

  // Busca todos os dados em paralelo
  const [dailyResponse, answeredResponse, wrongResponse, evolutionResponse] = await Promise.all([
    fetchDailyAnswered(token),
    fetchAnsweredQuestions(token),
    fetchEverAnsweredWrong(token),
    fetchRightAnswersEvolution(token),
  ]);

  console.log('Daily response:', dailyResponse);
  console.log('Answered response:', answeredResponse);
  console.log('Wrong response:', wrongResponse);
  console.log('Evolution response:', evolutionResponse);

  // Extrai os dados
  const dailyQuestions = dailyResponse.data || [];
  const answeredData = answeredResponse.data || { total: 0, correct: 0, wrong: 0, accuracy: 0 };
  const wrongData = wrongResponse.data || { total: 0, questions: [] };
  const evolutionData = evolutionResponse.data || [];

  // Calcula métricas
  const totalDaysStudied = dailyQuestions.length;
  const bestStreak = calculateStreak(dailyQuestions);
  const averageQuestionsPerDay = totalDaysStudied > 0 
    ? Math.round(answeredData.total / totalDaysStudied) 
    : 0;

  // Por especialidade (se disponível)
  const bySpecialty = (answeredData.byTag || [])
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map((tag, index) => ({
      rank: index + 1,
      title: tag.tagName,
      total: tag.total,
      correct: tag.correct,
      value: `${tag.total} questões`,
    }));

  // Determina personalidade
  const personality = determinePersonality({
    questionsTotal: answeredData.total,
    accuracyRate: answeredData.accuracy || (answeredData.total > 0 ? (answeredData.correct / answeredData.total) * 100 : 0),
    streak: bestStreak,
    totalDays: totalDaysStudied,
    averagePerDay: averageQuestionsPerDay,
  });

  // Gera fun fact
  const funFact = generateFunFact({
    questionsTotal: answeredData.total,
    accuracyRate: answeredData.accuracy || (answeredData.total > 0 ? (answeredData.correct / answeredData.total) * 100 : 0),
    streak: bestStreak,
    totalDays: totalDaysStudied,
    hardestCount: wrongData.total || wrongData.questions?.length || 0,
  });

  return {
    dailyQuestions,
    questionsTotal: answeredData.total,
    questionsCorrect: answeredData.correct,
    questionsWrong: answeredData.wrong,
    accuracyRate: answeredData.accuracy || (answeredData.total > 0 ? (answeredData.correct / answeredData.total) * 100 : 0),
    hardestQuestionsCount: wrongData.total || wrongData.questions?.length || 0,
    accuracyEvolution: evolutionData,
    totalDaysStudied,
    bestStreak,
    peakStudyHour: 20, // Default, poderia ser calculado se tivéssemos dados de hora
    averageQuestionsPerDay,
    personality,
    funFact,
    bySpecialty: bySpecialty.length > 0 ? bySpecialty : [
      { rank: 1, title: 'Clínica Médica', total: 0, correct: 0, value: '0 questões' },
      { rank: 2, title: 'Cirurgia', total: 0, correct: 0, value: '0 questões' },
      { rank: 3, title: 'Pediatria', total: 0, correct: 0, value: '0 questões' },
    ],
  };
}

