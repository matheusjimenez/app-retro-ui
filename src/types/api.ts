// Tipos baseados nos endpoints da API do QBank

// GET /v3/reports/questions/answered/daily
export interface DailyAnsweredQuestion {
  date: string;
  total: number;
  correct: number;
  wrong: number;
}

export interface DailyAnsweredResponse {
  data: DailyAnsweredQuestion[];
}

// GET /v3/reports/questions/answered
export interface AnsweredQuestionsResponse {
  data: {
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
    byTag?: Array<{
      tagId: number;
      tagName: string;
      total: number;
      correct: number;
      wrong: number;
    }>;
  };
}

// GET /v3/reports/questions/ever-answered-wrong
export interface EverAnsweredWrongResponse {
  data: {
    total: number;
    questions: Array<{
      questionId: string;
      wrongCount: number;
      lastWrongAt: string;
    }>;
  };
}

// GET /v3/reports/graph/right-answers-evolution
export interface RightAnswersEvolutionResponse {
  data: Array<{
    date: string;
    accuracyRate: number;
    totalAnswered: number;
    totalCorrect: number;
  }>;
}

// Tipo consolidado para estatísticas da retrospectiva
export interface RetrospectiveStats {
  // Dados diários de questões respondidas
  dailyQuestions: DailyAnsweredQuestion[];
  
  // Resumo geral de questões
  questionsTotal: number;
  questionsCorrect: number;
  questionsWrong: number;
  accuracyRate: number;
  
  // Questões que mais errou
  hardestQuestionsCount: number;
  
  // Evolução da taxa de acerto
  accuracyEvolution: Array<{
    date: string;
    accuracyRate: number;
    totalAnswered: number;
    totalCorrect: number;
  }>;
  
  // Métricas calculadas
  totalDaysStudied: number;
  bestStreak: number;
  peakStudyHour: number;
  averageQuestionsPerDay: number;
  dailyRecord: number;
  dailyRecordDate: string;
  bestMonth: string;
  bestMonthCount: number;
  
  // Personalidade
  personality: {
    type: string;
    description: string;
  };
  
  // Fun fact
  funFact: string;
  
  // Por especialidade/tag
  bySpecialty: Array<{
    rank: number;
    title: string;
    total: number;
    correct: number;
    value: string;
  }>;
  
  // Flashcards stats (MongoDB)
  flashcardsTotal: number;
  flashcardsScoreDistribution: {
    naoLembrei: number;
    dificil: number;
    bom: number;
    facil: number;
  };
  
  // Videos stats (MongoDB)
  videosWatched: number;
  videosFinished: number;
  videosTotalHoursWatched: number;
  videosPeakDay?: {
    date: string;
    hours: number;
  };
  
  // Total study time (questions + flashcards + videos)
  totalStudyHours: number;
}

// Dados do usuário do JWT decodificado
export interface JWTUserData {
  id: number;
  email: string;
  name: string;
  profileId: number;
  photo?: string;
  anonName?: string;
}

