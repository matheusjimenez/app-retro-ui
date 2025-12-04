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

// Calcula a maior sequência de dias estudando consecutivos
// Filtra apenas dias com count > 0 (dias que realmente estudou)
function calculateStreak(dailyData: Array<{ date: string; count?: number; total?: number }>): number {
  if (!dailyData || dailyData.length === 0) return 0;

  // Filtra apenas dias com atividade (count > 0 ou total > 0)
  const activeDays = dailyData.filter((d) => (d.count || 0) > 0 || (d.total || 0) > 0);
  
  if (activeDays.length === 0) return 0;

  const sortedDates = activeDays
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

// Conta total de dias com atividade
function countStudyDays(dailyData: Array<{ date: string; count?: number; total?: number }>): number {
  if (!dailyData || dailyData.length === 0) return 0;
  
  // Conta apenas dias com count > 0 ou total > 0
  return dailyData.filter((d) => (d.count || 0) > 0 || (d.total || 0) > 0).length;
}

// Calcula o recorde diário (maior número de questões em um único dia)
function calculateDailyRecord(dailyData: Array<{ date: string; count?: number; total?: number }>): { count: number; date: string } {
  if (!dailyData || dailyData.length === 0) return { count: 0, date: '' };
  
  let maxCount = 0;
  let maxDate = '';
  
  for (const day of dailyData) {
    const count = day.count || day.total || 0;
    if (count > maxCount) {
      maxCount = count;
      maxDate = day.date;
    }
  }
  
  return { count: maxCount, date: maxDate };
}

// Calcula o mês mais produtivo (maior soma de questões)
function calculateBestMonth(dailyData: Array<{ date: string; count?: number; total?: number }>): { month: string; count: number } {
  if (!dailyData || dailyData.length === 0) return { month: '', count: 0 };
  
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  const monthTotals: Record<string, number> = {};
  
  for (const day of dailyData) {
    const count = day.count || day.total || 0;
    if (count > 0) {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthTotals[monthKey] = (monthTotals[monthKey] || 0) + count;
    }
  }
  
  let bestMonth = '';
  let bestCount = 0;
  
  for (const [key, total] of Object.entries(monthTotals)) {
    if (total > bestCount) {
      bestCount = total;
      const [, monthIdx] = key.split('-');
      bestMonth = monthNames[parseInt(monthIdx)];
    }
  }
  
  return { month: bestMonth, count: bestCount };
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

  console.log('Daily response:', JSON.stringify(dailyResponse, null, 2));
  console.log('Answered response:', JSON.stringify(answeredResponse, null, 2));
  console.log('Wrong response:', JSON.stringify(wrongResponse, null, 2));
  console.log('Evolution response:', JSON.stringify(evolutionResponse, null, 2));

  // Extrai os dados - a API pode retornar dentro de .data ou diretamente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyQuestions = (dailyResponse as any).data || (Array.isArray(dailyResponse) ? dailyResponse : []);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawAnswered = answeredResponse as any;
  const answeredData = rawAnswered.data || rawAnswered || { total: 0, correct: 0, wrong: 0, accuracy: 0 };
  
  // Normaliza os campos (API pode usar nomes diferentes)
  const normalizedAnswered = {
    total: answeredData.totalQuestionsAnswered || answeredData.total || 0,
    correct: answeredData.totalQuestionsAnsweredCount?.rightQuestionsCount || answeredData.correct || 0,
    wrong: answeredData.totalQuestionsAnsweredCount?.wrongQuestionsCount || answeredData.wrong || 0,
    accuracy: answeredData.totalQuestionsAnsweredCount?.rightQuestionsPercentage || answeredData.accuracy || 0,
    byTag: answeredData.byTag || [],
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawWrong = wrongResponse as any;
  const wrongData = rawWrong.data || rawWrong || { count: 0, questions: [] };
  const wrongCount = wrongData.count || wrongData.total || (wrongData.questions?.length) || 0;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawEvolution = evolutionResponse as any;
  const evolutionData = rawEvolution.data || rawEvolution.datasets || rawEvolution || [];

  console.log('Normalized answered:', normalizedAnswered);
  console.log('Wrong count:', wrongCount);

  // Calcula métricas - usa apenas dias com atividade (count > 0)
  const totalDaysStudied = countStudyDays(dailyQuestions);
  const bestStreak = calculateStreak(dailyQuestions);
  const averageQuestionsPerDay = totalDaysStudied > 0 
    ? Math.round(normalizedAnswered.total / totalDaysStudied) 
    : 0;
  
  // Novas métricas
  const dailyRecord = calculateDailyRecord(dailyQuestions);
  const bestMonth = calculateBestMonth(dailyQuestions);
    
  console.log('totalDaysStudied (with activity):', totalDaysStudied);
  console.log('bestStreak:', bestStreak);
  console.log('dailyRecord:', dailyRecord);
  console.log('bestMonth:', bestMonth);

  // Por especialidade (se disponível no evolutionResponse - datasets por especialidade)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let bySpecialty: any[] = [];
  
  // Tenta extrair de byTag primeiro
  if (normalizedAnswered.byTag && normalizedAnswered.byTag.length > 0) {
    bySpecialty = normalizedAnswered.byTag
      .sort((a: { total: number }, b: { total: number }) => b.total - a.total)
      .slice(0, 5)
      .map((tag: { tagName: string; total: number; correct: number }, index: number) => ({
        rank: index + 1,
        title: tag.tagName,
        total: tag.total,
        correct: tag.correct,
        value: `${tag.total.toLocaleString('pt-BR')} questões`,
      }));
  }
  
  // Se não tiver byTag, tenta extrair dos datasets do evolution (especialidades)
  // Os datasets contêm arrays de percentuais de acerto por mês
  if (bySpecialty.length === 0 && rawEvolution.datasets) {
    // Calcula total de questões para estimar distribuição
    const totalQuestoes = normalizedAnswered.total || 0;
    
    // Processa todos os datasets para calcular proporção
    const especialidadesProcessadas = rawEvolution.datasets
      .filter((ds: { label: string }) => ds.label !== 'Todas as Especialidades')
      .map((ds: { label: string; dataset: number[] }) => {
        // dataset é array de percentuais (números) - um por mês
        const percentuais = Array.isArray(ds.dataset) ? ds.dataset : [];
        // Filtra meses com atividade (percentual > 0)
        const mesesAtivos = percentuais.filter((p: number) => p > 0);
        // Calcula média de acerto
        const mediaAcerto = mesesAtivos.length > 0 
          ? mesesAtivos.reduce((sum: number, p: number) => sum + p, 0) / mesesAtivos.length 
          : 0;
        // Conta meses com atividade como indicador de dedicação
        const mesesEstudados = mesesAtivos.length;
        // Soma dos percentuais como peso (indica intensidade de estudo)
        const pesoTotal = percentuais.reduce((sum: number, p: number) => sum + p, 0);
        
        return {
          label: ds.label,
          mediaAcerto,
          mesesEstudados,
          pesoTotal,
        };
      });
    
    // Calcula peso total para distribuição proporcional
    const pesoGeral = especialidadesProcessadas.reduce(
      (sum: number, e: { pesoTotal: number }) => sum + e.pesoTotal, 0
    );
    
    bySpecialty = especialidadesProcessadas
      // Ordena por meses estudados (mais dedicação) depois por média de acerto
      .sort((a: { mesesEstudados: number; mediaAcerto: number }, b: { mesesEstudados: number; mediaAcerto: number }) => {
        if (b.mesesEstudados !== a.mesesEstudados) {
          return b.mesesEstudados - a.mesesEstudados;
        }
        return b.mediaAcerto - a.mediaAcerto;
      })
      .slice(0, 5)
      .map((item: { label: string; mediaAcerto: number; mesesEstudados: number; pesoTotal: number }, index: number) => {
        // Estima questões proporcionalmente ao peso
        const questoesEstimadas = pesoGeral > 0 
          ? Math.round((item.pesoTotal / pesoGeral) * totalQuestoes)
          : 0;
        
        return {
          rank: index + 1,
          title: item.label,
          total: questoesEstimadas,
          correct: Math.round(questoesEstimadas * (item.mediaAcerto / 100)),
          value: `${questoesEstimadas.toLocaleString('pt-BR')} questões • ${item.mediaAcerto.toFixed(0)}% acerto`,
        };
      });
  }
  
  console.log('bySpecialty:', bySpecialty);

  // Calcula taxa de acerto
  // A API pode retornar como decimal (0.27) ou percentual (27)
  let calculatedAccuracy = normalizedAnswered.accuracy || 
    (normalizedAnswered.total > 0 ? (normalizedAnswered.correct / normalizedAnswered.total) * 100 : 0);
  
  // Se o valor estiver entre 0 e 1, converte para percentual
  if (calculatedAccuracy > 0 && calculatedAccuracy <= 1) {
    calculatedAccuracy = calculatedAccuracy * 100;
  }
  
  console.log('calculatedAccuracy:', calculatedAccuracy);

  // Determina personalidade
  const personality = determinePersonality({
    questionsTotal: normalizedAnswered.total,
    accuracyRate: calculatedAccuracy,
    streak: bestStreak,
    totalDays: totalDaysStudied,
    averagePerDay: averageQuestionsPerDay,
  });

  // Gera fun fact
  const funFact = generateFunFact({
    questionsTotal: normalizedAnswered.total,
    accuracyRate: calculatedAccuracy,
    streak: bestStreak,
    totalDays: totalDaysStudied,
    hardestCount: wrongCount,
  });

  const result: RetrospectiveStats = {
    dailyQuestions: Array.isArray(dailyQuestions) ? dailyQuestions : [],
    questionsTotal: normalizedAnswered.total,
    questionsCorrect: normalizedAnswered.correct,
    questionsWrong: normalizedAnswered.wrong,
    accuracyRate: calculatedAccuracy,
    hardestQuestionsCount: wrongCount,
    accuracyEvolution: Array.isArray(evolutionData) ? evolutionData : [],
    totalDaysStudied,
    bestStreak,
    peakStudyHour: 20, // Default, poderia ser calculado se tivéssemos dados de hora
    averageQuestionsPerDay,
    dailyRecord: dailyRecord.count,
    dailyRecordDate: dailyRecord.date,
    bestMonth: bestMonth.month,
    bestMonthCount: bestMonth.count,
    personality,
    funFact,
    bySpecialty: bySpecialty.length > 0 ? bySpecialty : [
      { rank: 1, title: 'Sem dados', total: 0, correct: 0, value: '0 questões' },
    ],
  };

  console.log('Final result:', JSON.stringify(result, null, 2));
  
  return result;
}

