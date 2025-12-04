import QBankTestInteraction from '@/models/QBankTestInteraction';
import UserFlashCardInteraction from '@/models/UserFlashCardInteraction';
import VideoDailyTracker from '@/models/VideoDailyTracker';

export interface QuestionStats {
  total: number;
  correct: number;
  accuracyRate: number;
}

export interface FlashcardStats {
  total: number;
  scoreDistribution: {
    naoLembrei: number;
    dificil: number;
    bom: number;
    facil: number;
  };
}

export interface VideoStats {
  watched: number;
  finished: number;
  totalSecondsWatched: number;
  totalHoursWatched: number;
}

export interface DailyStats {
  date: string;
  questionsAnswered: number;
  questionsCorrect: number;
  flashcardsAnswered: number;
  videosWatched: number;
  videosFinished: number;
  videoSecondsWatched: number;
  questionTimeInSeconds: number;
  flashcardTimeInSeconds: number;
  totalUsageInSeconds: number;
}

export interface StudyTimeStats {
  totalSeconds: number;
  totalHours: number;
  averageSecondsPerDay: number;
  averageHoursPerDay: number;
}

export interface StudentStatistics {
  userId: number;
  year: number;
  questions: QuestionStats;
  flashcards: FlashcardStats;
  videos: VideoStats;
  studyTime: StudyTimeStats;
  dailyBreakdown: DailyStats[];
  topSpecialties: Array<{
    rank: number;
    title: string;
    value: string;
    hours: number;
  }>;
  personality: {
    type: string;
    description: string;
  };
  funFact: string;
  studyStreak: number;
  peakStudyHour: number;
}

// Questões respondidas por dia
export async function getQuestionsPerDay(userId: number, startDate: Date, endDate: Date) {
  return await QBankTestInteraction.aggregate([
    {
      $match: {
        userId: userId,
        'deleted.isDeleted': false,
        updatedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: '$updatedAt',
            format: '%Y-%m-%d',
            timezone: 'America/Sao_Paulo',
          },
        },
        questionsAnswered: { $sum: 1 },
        questionsCorrect: {
          $sum: { $cond: [{ $eq: ['$wasRight', true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        questionsAnswered: 1,
        questionsCorrect: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);
}

// Tempo de uso em questões (cap de 300s entre interações)
export async function getQuestionTimeUsage(userId: number, startDate: Date, endDate: Date) {
  return await QBankTestInteraction.aggregate([
    {
      $match: {
        userId: userId,
        updatedAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $sort: { updatedAt: 1 } },
    {
      $group: {
        _id: {
          $dateToString: {
            date: '$updatedAt',
            format: '%Y-%m-%d',
            timezone: 'America/Sao_Paulo',
          },
        },
        times: { $push: '$updatedAt' },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalTimeInSeconds: {
          $cond: {
            if: { $lt: [{ $size: '$times' }, 2] },
            then: 0,
            else: {
              $sum: {
                $map: {
                  input: {
                    $zip: {
                      inputs: ['$times', { $slice: ['$times', 1, { $size: '$times' }] }],
                    },
                  },
                  as: 'pair',
                  in: {
                    $min: [
                      300,
                      {
                        $divide: [
                          {
                            $subtract: [
                              { $arrayElemAt: ['$$pair', 1] },
                              { $arrayElemAt: ['$$pair', 0] },
                            ],
                          },
                          1000,
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    { $sort: { date: 1 } },
  ]);
}

// Flashcards por dia
export async function getFlashcardsPerDay(userId: number, startDate: Date, endDate: Date) {
  return await UserFlashCardInteraction.aggregate([
    {
      $match: {
        userId: userId,
        'deleted.isDeleted': { $ne: true },
        updatedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: '$updatedAt',
            format: '%Y-%m-%d',
            timezone: 'America/Sao_Paulo',
          },
        },
        totalFlashcards: { $sum: 1 },
        score0: { $sum: { $cond: [{ $eq: ['$score', 0] }, 1, 0] } },
        score1: { $sum: { $cond: [{ $eq: ['$score', 1] }, 1, 0] } },
        score2: { $sum: { $cond: [{ $eq: ['$score', 2] }, 1, 0] } },
        score3: { $sum: { $cond: [{ $eq: ['$score', 3] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalFlashcards: 1,
        scores: {
          naoLembrei: '$score0',
          dificil: '$score1',
          bom: '$score2',
          facil: '$score3',
        },
      },
    },
    { $sort: { date: 1 } },
  ]);
}

// Tempo de uso em flashcards (cap de 60s entre interações)
export async function getFlashcardTimeUsage(userId: number, startDate: Date, endDate: Date) {
  return await UserFlashCardInteraction.aggregate([
    {
      $match: {
        userId: userId,
        'deleted.isDeleted': { $ne: true },
        updatedAt: { $gte: startDate, $lte: endDate },
      },
    },
    { $sort: { updatedAt: 1 } },
    {
      $group: {
        _id: {
          $dateToString: {
            date: '$updatedAt',
            format: '%Y-%m-%d',
            timezone: 'America/Sao_Paulo',
          },
        },
        times: { $push: '$updatedAt' },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        totalTimeInSeconds: {
          $cond: {
            if: { $lt: [{ $size: '$times' }, 2] },
            then: 0,
            else: {
              $sum: {
                $map: {
                  input: {
                    $zip: {
                      inputs: ['$times', { $slice: ['$times', 1, { $size: '$times' }] }],
                    },
                  },
                  as: 'pair',
                  in: {
                    $min: [
                      60,
                      {
                        $divide: [
                          {
                            $subtract: [
                              { $arrayElemAt: ['$$pair', 1] },
                              { $arrayElemAt: ['$$pair', 0] },
                            ],
                          },
                          1000,
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    { $sort: { date: 1 } },
  ]);
}

// Vídeos assistidos por dia
export async function getVideosWatched(userId: number, startDate: Date, endDate: Date) {
  return await VideoDailyTracker.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lt: endDate },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            date: '$date',
            format: '%Y-%m-%d',
            timezone: 'America/Sao_Paulo',
          },
        },
        videosWatched: 1,
        videosFinished: 1,
        totalSecondsWatched: '$dailyTotalSecondsWatched',
      },
    },
    { $sort: { date: 1 } },
  ]);
}

// Top especialidades por tempo de estudo (baseado em tags dos vídeos)
export async function getTopSpecialties(userId: number, startDate: Date, endDate: Date) {
  const result = await VideoDailyTracker.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lt: endDate },
      },
    },
    { $unwind: '$trackers' },
    { $unwind: '$trackers.tags' },
    {
      $group: {
        _id: '$trackers.tags.rootParentTagName',
        totalSeconds: { $sum: '$trackers.totalSecondsWatched' },
      },
    },
    { $sort: { totalSeconds: -1 } },
    { $limit: 5 },
  ]);

  return result.map((item, index) => ({
    rank: index + 1,
    title: item._id || 'Geral',
    hours: Math.round(item.totalSeconds / 3600),
    value: `${Math.round(item.totalSeconds / 3600)} horas`,
  }));
}

// Horário pico de estudo
export async function getPeakStudyHour(userId: number, startDate: Date, endDate: Date) {
  const result = await QBankTestInteraction.aggregate([
    {
      $match: {
        userId: userId,
        'deleted.isDeleted': false,
        updatedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $hour: { date: '$updatedAt', timezone: 'America/Sao_Paulo' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);

  return result[0]?._id ?? 20; // Default 20h se não houver dados
}

// Maior sequência de dias estudando
export async function getStudyStreak(userId: number, startDate: Date, endDate: Date) {
  const questions = await getQuestionsPerDay(userId, startDate, endDate);
  const flashcards = await getFlashcardsPerDay(userId, startDate, endDate);
  const videos = await getVideosWatched(userId, startDate, endDate);

  // Combina todas as datas com atividade
  const activeDates = new Set<string>();
  questions.forEach((q) => activeDates.add(q.date));
  flashcards.forEach((f) => activeDates.add(f.date));
  videos.forEach((v) => activeDates.add(v.date));

  if (activeDates.size === 0) return 0;

  // Ordena as datas
  const sortedDates = Array.from(activeDates).sort();

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
  flashcardsTotal: number;
  videosTotal: number;
  accuracyRate: number;
  streak: number;
  peakHour: number;
}): { type: string; description: string } {
  const { questionsTotal, flashcardsTotal, videosTotal, accuracyRate, streak, peakHour } = stats;

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

  if (peakHour >= 22 || peakHour <= 5) {
    return {
      type: 'A Coruja Noturna',
      description:
        'Enquanto o mundo dorme, você está evoluindo. A noite é seu momento de máxima concentração!',
    };
  }

  if (peakHour >= 5 && peakHour <= 8) {
    return {
      type: 'O Madrugador',
      description:
        'Você aproveita as primeiras horas do dia para estudar. Disciplina matinal é seu diferencial!',
    };
  }

  if (flashcardsTotal > videosTotal && flashcardsTotal > questionsTotal) {
    return {
      type: 'O Memorizador',
      description:
        'Flashcards são sua arma secreta. Você domina a arte da repetição espaçada!',
    };
  }

  if (videosTotal > questionsTotal && videosTotal > flashcardsTotal) {
    return {
      type: 'O Visual',
      description:
        'Você aprende melhor assistindo. Vídeos são seu caminho preferido para absorver conhecimento!',
    };
  }

  return {
    type: 'O Equilibrado',
    description:
      'Você usa todas as ferramentas disponíveis de forma equilibrada. Versatilidade é sua marca!',
  };
}

// Gera fun fact baseado nos dados
function generateFunFact(stats: {
  peakHour: number;
  streak: number;
  questionsTotal: number;
  videosHours: number;
}): string {
  const funFacts = [];

  if (stats.peakHour >= 22 || stats.peakHour <= 5) {
    funFacts.push(
      `Você estudou mais às ${stats.peakHour}h do que em qualquer outro horário. Coruja noturna! 🦉`
    );
  } else if (stats.peakHour >= 5 && stats.peakHour <= 8) {
    funFacts.push(
      `Você é mais produtivo às ${stats.peakHour}h da manhã. Quem cedo madruga, aprova! ☀️`
    );
  }

  if (stats.streak >= 30) {
    funFacts.push(
      `Sua maior sequência foi de ${stats.streak} dias seguidos. Consistência nível hard! 🔥`
    );
  }

  if (stats.questionsTotal >= 10000) {
    funFacts.push(
      `Você resolveu ${stats.questionsTotal.toLocaleString()} questões. Isso daria um livro de ${Math.round(stats.questionsTotal / 10)} páginas! 📚`
    );
  }

  if (stats.videosHours >= 100) {
    funFacts.push(
      `Você assistiu ${Math.round(stats.videosHours)} horas de aulas. Isso é mais que uma temporada inteira de série! 🎬`
    );
  }

  return funFacts[Math.floor(Math.random() * funFacts.length)] || 
    'Você está no caminho certo! Continue assim! 💪';
}

// Função principal para buscar todas as estatísticas
export async function getStudentStatistics(
  userId: number,
  year: number
): Promise<StudentStatistics> {
  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

  // Busca todas as estatísticas em paralelo
  const [
    questionsPerDay,
    questionTime,
    flashcardsPerDay,
    flashcardTime,
    videosPerDay,
    topSpecialties,
    peakHour,
    streak,
  ] = await Promise.all([
    getQuestionsPerDay(userId, startDate, endDate),
    getQuestionTimeUsage(userId, startDate, endDate),
    getFlashcardsPerDay(userId, startDate, endDate),
    getFlashcardTimeUsage(userId, startDate, endDate),
    getVideosWatched(userId, startDate, endDate),
    getTopSpecialties(userId, startDate, endDate),
    getPeakStudyHour(userId, startDate, endDate),
    getStudyStreak(userId, startDate, endDate),
  ]);

  // Calcula totais de questões
  const questionsTotal = questionsPerDay.reduce((sum, q) => sum + q.questionsAnswered, 0);
  const questionsCorrect = questionsPerDay.reduce((sum, q) => sum + q.questionsCorrect, 0);
  const accuracyRate = questionsTotal > 0 ? (questionsCorrect / questionsTotal) * 100 : 0;

  // Calcula totais de flashcards
  const flashcardsTotal = flashcardsPerDay.reduce((sum, f) => sum + f.totalFlashcards, 0);
  const flashcardScores = flashcardsPerDay.reduce(
    (acc, f) => ({
      naoLembrei: acc.naoLembrei + (f.scores?.naoLembrei || 0),
      dificil: acc.dificil + (f.scores?.dificil || 0),
      bom: acc.bom + (f.scores?.bom || 0),
      facil: acc.facil + (f.scores?.facil || 0),
    }),
    { naoLembrei: 0, dificil: 0, bom: 0, facil: 0 }
  );

  // Calcula totais de vídeos
  const videosWatched = videosPerDay.reduce((sum, v) => sum + v.videosWatched, 0);
  const videosFinished = videosPerDay.reduce((sum, v) => sum + v.videosFinished, 0);
  const videoSeconds = videosPerDay.reduce((sum, v) => sum + v.totalSecondsWatched, 0);

  // Calcula tempo total
  const questionTimeTotal = questionTime.reduce((sum, q) => sum + q.totalTimeInSeconds, 0);
  const flashcardTimeTotal = flashcardTime.reduce((sum, f) => sum + f.totalTimeInSeconds, 0);
  const totalSeconds = questionTimeTotal + flashcardTimeTotal + videoSeconds;

  // Consolida estatísticas diárias
  const daysMap = new Map<string, DailyStats>();

  const createEmptyDay = (date: string): DailyStats => ({
    date,
    questionsAnswered: 0,
    questionsCorrect: 0,
    flashcardsAnswered: 0,
    videosWatched: 0,
    videosFinished: 0,
    videoSecondsWatched: 0,
    questionTimeInSeconds: 0,
    flashcardTimeInSeconds: 0,
    totalUsageInSeconds: 0,
  });

  questionsPerDay.forEach((q) => {
    const day = daysMap.get(q.date) || createEmptyDay(q.date);
    day.questionsAnswered = q.questionsAnswered;
    day.questionsCorrect = q.questionsCorrect;
    daysMap.set(q.date, day);
  });

  flashcardsPerDay.forEach((f) => {
    const day = daysMap.get(f.date) || createEmptyDay(f.date);
    day.flashcardsAnswered = f.totalFlashcards;
    daysMap.set(f.date, day);
  });

  videosPerDay.forEach((v) => {
    const day = daysMap.get(v.date) || createEmptyDay(v.date);
    day.videosWatched = v.videosWatched;
    day.videosFinished = v.videosFinished;
    day.videoSecondsWatched = v.totalSecondsWatched;
    daysMap.set(v.date, day);
  });

  questionTime.forEach((qt) => {
    const day = daysMap.get(qt.date) || createEmptyDay(qt.date);
    day.questionTimeInSeconds = qt.totalTimeInSeconds;
    daysMap.set(qt.date, day);
  });

  flashcardTime.forEach((ft) => {
    const day = daysMap.get(ft.date) || createEmptyDay(ft.date);
    day.flashcardTimeInSeconds = ft.totalTimeInSeconds;
    daysMap.set(ft.date, day);
  });

  // Calcula tempo total por dia
  const dailyBreakdown = Array.from(daysMap.values())
    .map((day) => ({
      ...day,
      totalUsageInSeconds:
        (day.questionTimeInSeconds || 0) +
        (day.flashcardTimeInSeconds || 0) +
        (day.videoSecondsWatched || 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const daysWithActivity = dailyBreakdown.filter((d) => d.totalUsageInSeconds > 0).length;

  // Determina personalidade e fun fact
  const personality = determinePersonality({
    questionsTotal,
    flashcardsTotal,
    videosTotal: videosWatched,
    accuracyRate,
    streak,
    peakHour,
  });

  const funFact = generateFunFact({
    peakHour,
    streak,
    questionsTotal,
    videosHours: videoSeconds / 3600,
  });

  return {
    userId,
    year,
    questions: {
      total: questionsTotal,
      correct: questionsCorrect,
      accuracyRate: Number(accuracyRate.toFixed(2)),
    },
    flashcards: {
      total: flashcardsTotal,
      scoreDistribution: flashcardScores,
    },
    videos: {
      watched: videosWatched,
      finished: videosFinished,
      totalSecondsWatched: videoSeconds,
      totalHoursWatched: Number((videoSeconds / 3600).toFixed(2)),
    },
    studyTime: {
      totalSeconds,
      totalHours: Number((totalSeconds / 3600).toFixed(2)),
      averageSecondsPerDay: daysWithActivity > 0 ? Math.round(totalSeconds / daysWithActivity) : 0,
      averageHoursPerDay:
        daysWithActivity > 0 ? Number((totalSeconds / daysWithActivity / 3600).toFixed(2)) : 0,
    },
    dailyBreakdown,
    topSpecialties:
      topSpecialties.length > 0
        ? topSpecialties
        : [
            { rank: 1, title: 'Clínica Médica', hours: 0, value: '0 horas' },
            { rank: 2, title: 'Cirurgia', hours: 0, value: '0 horas' },
            { rank: 3, title: 'Pediatria', hours: 0, value: '0 horas' },
          ],
    personality,
    funFact,
    studyStreak: streak,
    peakStudyHour: peakHour,
  };
}

