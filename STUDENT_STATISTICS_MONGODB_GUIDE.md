# Guia: Estatísticas de Aluno com MongoDB

Este documento explica como replicar a lógica de estatísticas de alunos (tempo de uso, questões feitas, flashcards, vídeos assistidos, etc.) para **um único aluno** usando MongoDB.

---

## 📋 Índice

1. [Collections Necessárias](#1-collections-necessárias)
2. [Schemas do MongoDB](#2-schemas-do-mongodb)
3. [Queries de Estatísticas](#3-queries-de-estatísticas)
   - [3.1 Questões Respondidas](#31-questões-respondidas)
   - [3.2 Tempo de Uso em Questões](#32-tempo-de-uso-em-questões)
   - [3.3 Flashcards Respondidos](#33-flashcards-respondidos)
   - [3.4 Tempo de Uso em Flashcards](#34-tempo-de-uso-em-flashcards)
   - [3.5 Vídeos Assistidos](#35-vídeos-assistidos)
   - [3.6 Tempo de Uso em Vídeos](#36-tempo-de-uso-em-vídeos)
   - [3.7 Estatísticas Consolidadas por Dia](#37-estatísticas-consolidadas-por-dia)
4. [Cálculo de Métricas](#4-cálculo-de-métricas)
5. [Exemplo de Implementação Completa](#5-exemplo-de-implementação-completa)

---

## 1. Collections Necessárias

Para calcular estatísticas de um aluno, você precisará das seguintes collections:

| Collection | Descrição |
|------------|-----------|
| `qbank_test_interactions` | Interações do aluno com questões |
| `userflashcardinteractions` | Interações do aluno com flashcards |
| `video_daily_tracker` | Tracking diário de vídeos assistidos (novo) |
| `video_tracker` | Tracking de vídeos assistidos (legado) |

---

## 2. Schemas do MongoDB

### 2.1 Schema de Interações de Questões

```javascript
const QBankTestInteractionSchema = new Schema({
  // Identificador do usuário (número inteiro)
  userId: { required: true, type: Number },
  
  // ID da questão respondida
  questionId: { required: true, type: ObjectId, refs: "qbank_questions" },
  
  // ID da resposta selecionada
  answerId: { required: true, type: ObjectId },
  
  // Se acertou ou não
  wasRight: { required: true, type: Boolean },
  
  // Se a questão foi anulada
  wasNulledQuestion: { required: true, type: Boolean },
  
  // Modo do teste (estudo, simulado, etc.)
  testMode: { required: true, type: String, enum: ["study", "test", "ranked"] },
  
  // Se é simulado ranqueado
  isRankedTest: { required: true, type: Boolean },
  
  // ID do simulado pré-montado (se aplicável)
  prebuiltTestId: { type: ObjectId, refs: "qbank_prebuilt_tests" },
  
  // Controle de deleção lógica
  deleted: {
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  }
}, { timestamps: true }); // createdAt e updatedAt automáticos
```

### 2.2 Schema de Interações de Flashcards

```javascript
const UserFlashCardInteractionSchema = new Schema({
  // Identificador do usuário
  userId: { ref: "users", type: Mixed },
  
  // ID do flashcard respondido
  flashCardId: { ref: "flashcards", type: ObjectId },
  
  // ID da pilha de flashcards
  flashCardStackId: { ref: "userflashcardstacks", type: ObjectId },
  
  // Score dado pelo usuário (0-3: não lembrei, difícil, bom, fácil)
  score: { type: Number },
  
  // Tempo gasto na resposta (em segundos)
  timeInSeconds: { type: Number },
  
  // Dados do algoritmo de repetição espaçada
  ease: { type: Number },
  repetition: { type: Number },
  intervalInMinutes: { type: Number },
  intervalDate: { type: Date },
  
  // Controle de deleção lógica
  deleted: {
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
  }
}, { timestamps: true });
```

### 2.3 Schema de Tracking de Vídeos (Diário)

```javascript
// Schema para tags associadas ao vídeo
const VideoDailyTrackerTagSchema = new Schema({
  tagId: { required: true, type: ObjectId },
  tagName: { required: true, type: String },
  rootParentTagId: { required: true, type: ObjectId },
  rootParentTagName: { required: true, type: String }
}, { _id: false });

// Schema para cada vídeo assistido no dia
const VideoDailyTrackerTrackerSchema = new Schema({
  videoId: { required: true, type: ObjectId },
  aqfmId: { required: true, type: Number },
  productId: { required: true, type: Number },
  blockNumber: { required: true, type: Number },
  
  // Progresso: array de tuplas [segundoInicio, segundoFim]
  progress: [[{ required: true, type: Number }]],
  
  // Total de segundos assistidos
  totalSecondsWatched: { required: true, type: Number },
  videoTotalSeconds: { required: true, type: Number },
  
  // Se finalizou o vídeo
  wasFinished: { required: true, type: Boolean },
  
  pings: { required: true, type: Number },
  lastSeenAt: { required: true, type: Date },
  ips: [{ required: true, type: String }],
  tags: { required: true, type: [VideoDailyTrackerTagSchema] }
}, { _id: false });

// Schema principal
const VideoDailyTrackerSchema = new Schema({
  userId: { required: true, type: Number },
  date: { required: true, type: Date },
  
  // Todos os vídeos assistidos no dia
  trackers: { required: true, type: [VideoDailyTrackerTrackerSchema] },
  
  // Totais do dia
  dailyTotalSecondsWatched: { required: true, type: Number },
  videosWatched: { required: true, type: Number },
  videosFinished: { required: true, type: Number }
}, { timestamps: true });
```

### 2.4 Schema de Estatísticas Consolidadas (Opcional)

Se quiser persistir estatísticas diárias processadas:

```javascript
const UserDailyStatisticsSchema = new Schema({
  date: { required: true, type: Date },
  
  // Metadados do usuário
  metadata: {
    userId: { required: true, type: Number },
    profileId: { required: true, type: Number }
  },
  
  // Estatísticas de questões
  questionsAnswered: { required: true, type: Number },
  questionsAnsweredRight: { required: true, type: Number },
  
  // Estatísticas de flashcards
  flashcardsAnswered: { required: true, type: Number },
  
  // Estatísticas de vídeos
  videosWatched: { required: true, type: Number },
  videosFinished: { required: true, type: Number },
  
  // Tempo total de uso (em segundos)
  totalUsageInSeconds: { default: 0, type: Number },
  
  createdAt: { default: Date.now, type: Date },
  updatedAt: { default: Date.now, type: Date }
}, {
  // Usar Time Series para melhor performance em queries temporais
  timeseries: {
    granularity: "days",
    metaField: "metadata",
    timeField: "date"
  }
});
```

---

## 3. Queries de Estatísticas

### 3.1 Questões Respondidas

**Total de questões respondidas por um aluno em um período:**

```javascript
async function getTotalQuestionsAnswered(userId, startDate, endDate) {
  const result = await QBankTestInteractionModel.aggregate([
    {
      $match: {
        userId: userId,
        "deleted.isDeleted": false,
        updatedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalQuestions: { $sum: 1 },
        totalCorrect: {
          $sum: { $cond: [{ $eq: ["$wasRight", true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalQuestions: 1,
        totalCorrect: 1,
        accuracyRate: {
          $cond: [
            { $gt: ["$totalQuestions", 0] },
            { $divide: ["$totalCorrect", "$totalQuestions"] },
            0
          ]
        }
      }
    }
  ]);

  return result[0] || { totalQuestions: 0, totalCorrect: 0, accuracyRate: 0 };
}
```

**Questões respondidas por dia:**

```javascript
async function getQuestionsPerDay(userId, startDate, endDate) {
  return await QBankTestInteractionModel.aggregate([
    {
      $match: {
        userId: userId,
        "deleted.isDeleted": false,
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$updatedAt",
            format: "%Y-%m-%d",
            timezone: "America/Sao_Paulo"
          }
        },
        questionsAnswered: { $sum: 1 },
        questionsCorrect: {
          $sum: { $cond: [{ $eq: ["$wasRight", true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        questionsAnswered: 1,
        questionsCorrect: 1
      }
    },
    { $sort: { date: 1 } }
  ]);
}
```

---

### 3.2 Tempo de Uso em Questões

O tempo de uso é calculado pela diferença entre timestamps consecutivos de interações, com um cap de **300 segundos** (5 minutos) para evitar que períodos de inatividade inflem os números.

```javascript
async function getQuestionTimeUsage(userId, startDate, endDate) {
  return await QBankTestInteractionModel.aggregate([
    {
      $match: {
        userId: userId,
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    { $sort: { updatedAt: 1 } },
    {
      // Agrupa por dia
      $group: {
        _id: {
          $dateToString: {
            date: "$updatedAt",
            format: "%Y-%m-%d",
            timezone: "America/Sao_Paulo"
          }
        },
        times: { $push: "$updatedAt" }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalTimeInSeconds: {
          $cond: {
            // Se tiver menos de 2 interações, não dá pra calcular tempo
            if: { $lt: [{ $size: "$times" }, 2] },
            then: 0,
            else: {
              // Soma das diferenças entre timestamps consecutivos
              $sum: {
                $map: {
                  input: {
                    // Cria pares de timestamps consecutivos
                    $zip: {
                      inputs: [
                        "$times",
                        { $slice: ["$times", 1, { $size: "$times" }] }
                      ]
                    }
                  },
                  as: "pair",
                  in: {
                    // Cap de 300 segundos por intervalo
                    $min: [
                      300,
                      {
                        $divide: [
                          {
                            $subtract: [
                              { $arrayElemAt: ["$$pair", 1] },
                              { $arrayElemAt: ["$$pair", 0] }
                            ]
                          },
                          1000 // Converter de ms para segundos
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    { $sort: { date: 1 } }
  ]);
}
```

**Tempo total de questões no período:**

```javascript
async function getTotalQuestionTime(userId, startDate, endDate) {
  const dailyTimes = await getQuestionTimeUsage(userId, startDate, endDate);
  return dailyTimes.reduce((sum, day) => sum + day.totalTimeInSeconds, 0);
}
```

---

### 3.3 Flashcards Respondidos

**Total de flashcards respondidos:**

```javascript
async function getTotalFlashcardsAnswered(userId, startDate, endDate) {
  return await UserFlashCardInteractionModel.countDocuments({
    userId: userId,
    "deleted.isDeleted": { $ne: true },
    updatedAt: { $gte: startDate, $lte: endDate }
  });
}
```

**Flashcards por dia com distribuição de scores:**

```javascript
async function getFlashcardsPerDay(userId, startDate, endDate) {
  return await UserFlashCardInteractionModel.aggregate([
    {
      $match: {
        userId: userId,
        "deleted.isDeleted": { $ne: true },
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$updatedAt",
            format: "%Y-%m-%d",
            timezone: "America/Sao_Paulo"
          }
        },
        totalFlashcards: { $sum: 1 },
        // Distribuição de scores (0-3)
        score0: { $sum: { $cond: [{ $eq: ["$score", 0] }, 1, 0] } },
        score1: { $sum: { $cond: [{ $eq: ["$score", 1] }, 1, 0] } },
        score2: { $sum: { $cond: [{ $eq: ["$score", 2] }, 1, 0] } },
        score3: { $sum: { $cond: [{ $eq: ["$score", 3] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalFlashcards: 1,
        scores: {
          naoLembrei: "$score0",
          dificil: "$score1",
          bom: "$score2",
          facil: "$score3"
        }
      }
    },
    { $sort: { date: 1 } }
  ]);
}
```

---

### 3.4 Tempo de Uso em Flashcards

O cálculo é similar ao de questões, mas com cap de **60 segundos** (flashcards são mais rápidos).

```javascript
async function getFlashcardTimeUsage(userId, startDate, endDate) {
  return await UserFlashCardInteractionModel.aggregate([
    {
      $match: {
        userId: userId,
        "deleted.isDeleted": { $ne: true },
        updatedAt: { $gte: startDate, $lte: endDate }
      }
    },
    { $sort: { updatedAt: 1 } },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$updatedAt",
            format: "%Y-%m-%d",
            timezone: "America/Sao_Paulo"
          }
        },
        times: { $push: "$updatedAt" }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalTimeInSeconds: {
          $cond: {
            if: { $lt: [{ $size: "$times" }, 2] },
            then: 0,
            else: {
              $sum: {
                $map: {
                  input: {
                    $zip: {
                      inputs: [
                        "$times",
                        { $slice: ["$times", 1, { $size: "$times" }] }
                      ]
                    }
                  },
                  as: "pair",
                  in: {
                    // Cap de 60 segundos para flashcards
                    $min: [
                      60,
                      {
                        $divide: [
                          {
                            $subtract: [
                              { $arrayElemAt: ["$$pair", 1] },
                              { $arrayElemAt: ["$$pair", 0] }
                            ]
                          },
                          1000
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    },
    { $sort: { date: 1 } }
  ]);
}
```

---

### 3.5 Vídeos Assistidos

**Usando video_daily_tracker (collection recomendada):**

```javascript
async function getVideosWatched(userId, startDate, endDate) {
  return await VideoDailyTrackerModel.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateToString: {
            date: "$date",
            format: "%Y-%m-%d",
            timezone: "America/Sao_Paulo"
          }
        },
        videosWatched: 1,
        videosFinished: 1,
        totalSecondsWatched: "$dailyTotalSecondsWatched"
      }
    },
    { $sort: { date: 1 } }
  ]);
}
```

**Totais de vídeos no período:**

```javascript
async function getTotalVideosStats(userId, startDate, endDate) {
  const result = await VideoDailyTrackerModel.aggregate([
    {
      $match: {
        userId: userId,
        date: { $gte: startDate, $lt: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalVideosWatched: { $sum: "$videosWatched" },
        totalVideosFinished: { $sum: "$videosFinished" },
        totalSecondsWatched: { $sum: "$dailyTotalSecondsWatched" }
      }
    },
    {
      $project: {
        _id: 0,
        totalVideosWatched: 1,
        totalVideosFinished: 1,
        totalSecondsWatched: 1,
        totalHoursWatched: {
          $divide: ["$totalSecondsWatched", 3600]
        }
      }
    }
  ]);

  return result[0] || {
    totalVideosWatched: 0,
    totalVideosFinished: 0,
    totalSecondsWatched: 0,
    totalHoursWatched: 0
  };
}
```

---

### 3.6 Tempo de Uso em Vídeos

O tempo de vídeo já vem calculado na collection `video_daily_tracker`. Para a collection legada (`video_tracker`), o tempo é calculado pela soma dos intervalos de progresso:

```javascript
async function getVideoTimeFromLegacyTracker(userId, startDate, endDate) {
  return await VideoTrackerModel.aggregate([
    {
      $match: {
        userId: userId,
        lastSeenAt: { $gte: startDate, $lt: endDate },
        "progress.0": { $exists: true } // Só documentos com progresso
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            date: "$lastSeenAt",
            format: "%Y-%m-%d",
            timezone: "America/Sao_Paulo"
          }
        },
        totalSecondsWatched: {
          $sum: {
            // Soma todos os intervalos de progresso
            $reduce: {
              input: "$progress",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  {
                    // Cada item do progress é [segundoInicio, segundoFim]
                    $subtract: [
                      { $ifNull: [{ $arrayElemAt: ["$$this", 1] }, 0] },
                      { $arrayElemAt: ["$$this", 0] }
                    ]
                  }
                ]
              }
            }
          }
        },
        videosWatched: { $sum: 1 },
        videosFinished: {
          $sum: { $cond: [{ $eq: ["$wasWatched", true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalSecondsWatched: 1,
        videosWatched: 1,
        videosFinished: 1
      }
    },
    { $sort: { date: 1 } }
  ]);
}
```

---

### 3.7 Estatísticas Consolidadas por Dia

**Query para obter todas as estatísticas de um aluno em um período:**

```javascript
async function getStudentDailyStatistics(userId, startDate, endDate) {
  // Busca todas as estatísticas em paralelo
  const [questions, flashcards, videos, questionTime, flashcardTime] = 
    await Promise.all([
      getQuestionsPerDay(userId, startDate, endDate),
      getFlashcardsPerDay(userId, startDate, endDate),
      getVideosWatched(userId, startDate, endDate),
      getQuestionTimeUsage(userId, startDate, endDate),
      getFlashcardTimeUsage(userId, startDate, endDate)
    ]);

  // Consolida por dia
  const daysMap = new Map();

  // Adiciona questões
  questions.forEach(q => {
    const day = daysMap.get(q.date) || createEmptyDay(q.date);
    day.questionsAnswered = q.questionsAnswered;
    day.questionsCorrect = q.questionsCorrect;
    daysMap.set(q.date, day);
  });

  // Adiciona flashcards
  flashcards.forEach(f => {
    const day = daysMap.get(f.date) || createEmptyDay(f.date);
    day.flashcardsAnswered = f.totalFlashcards;
    day.flashcardScores = f.scores;
    daysMap.set(f.date, day);
  });

  // Adiciona vídeos
  videos.forEach(v => {
    const day = daysMap.get(v.date) || createEmptyDay(v.date);
    day.videosWatched = v.videosWatched;
    day.videosFinished = v.videosFinished;
    day.videoSecondsWatched = v.totalSecondsWatched;
    daysMap.set(v.date, day);
  });

  // Adiciona tempo de questões
  questionTime.forEach(qt => {
    const day = daysMap.get(qt.date) || createEmptyDay(qt.date);
    day.questionTimeInSeconds = qt.totalTimeInSeconds;
    daysMap.set(qt.date, day);
  });

  // Adiciona tempo de flashcards
  flashcardTime.forEach(ft => {
    const day = daysMap.get(ft.date) || createEmptyDay(ft.date);
    day.flashcardTimeInSeconds = ft.totalTimeInSeconds;
    daysMap.set(ft.date, day);
  });

  // Calcula tempo total por dia
  const result = Array.from(daysMap.values()).map(day => ({
    ...day,
    totalUsageInSeconds: 
      (day.questionTimeInSeconds || 0) + 
      (day.flashcardTimeInSeconds || 0) + 
      (day.videoSecondsWatched || 0)
  }));

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function createEmptyDay(date) {
  return {
    date,
    questionsAnswered: 0,
    questionsCorrect: 0,
    flashcardsAnswered: 0,
    flashcardScores: { naoLembrei: 0, dificil: 0, bom: 0, facil: 0 },
    videosWatched: 0,
    videosFinished: 0,
    videoSecondsWatched: 0,
    questionTimeInSeconds: 0,
    flashcardTimeInSeconds: 0,
    totalUsageInSeconds: 0
  };
}
```

---

## 4. Cálculo de Métricas

### 4.1 Taxa de Acerto

```javascript
function calculateAccuracyRate(totalQuestions, totalCorrect) {
  if (totalQuestions === 0) return 0;
  return (totalCorrect / totalQuestions) * 100;
}
```

### 4.2 Média de Tempo por Dia

```javascript
function calculateAverageTimePerDay(dailyStats) {
  const daysWithActivity = dailyStats.filter(d => d.totalUsageInSeconds > 0);
  if (daysWithActivity.length === 0) return 0;
  
  const totalSeconds = daysWithActivity.reduce(
    (sum, day) => sum + day.totalUsageInSeconds, 
    0
  );
  
  return totalSeconds / daysWithActivity.length;
}
```

### 4.3 IDG (Índice de Dedicação Geral)

O IDG é um score composto que considera questões, flashcards, tempo de estudo e acerto:

```javascript
const IDG_WEIGHTS = {
  questions: 0.3,     // 30% do peso
  flashcards: 0.1,    // 10% do peso
  studyTime: 0.3,     // 30% do peso
  accuracy: 0.3       // 30% do peso
};

function calculateIDG(userStats, averageStats) {
  // Percentual de questões (limitado a 100%)
  const pQ = Math.min(
    (userStats.totalQuestions / averageStats.totalQuestions) * 100,
    100
  );

  // Percentual de flashcards (limitado a 100%)
  const pF = Math.min(
    (userStats.totalFlashcards / averageStats.totalFlashcards) * 100,
    100
  );

  // Percentual de tempo de estudo (limitado a 100%)
  const pV = Math.min(
    (userStats.totalStudyTime / averageStats.totalStudyTime) * 100,
    100
  );

  // Taxa de acerto (só considera se tiver >= 100 questões)
  let pA = 0;
  if (userStats.totalQuestions >= 100) {
    pA = Math.min(
      (userStats.totalCorrect / userStats.totalQuestions) * 100,
      100
    );
  }

  // Cálculo final do IDG
  const idg = 
    pQ * IDG_WEIGHTS.questions +
    pF * IDG_WEIGHTS.flashcards +
    pV * IDG_WEIGHTS.studyTime +
    pA * IDG_WEIGHTS.accuracy;

  return Number(idg.toFixed(1));
}
```

---

## 5. Exemplo de Implementação Completa

### 5.1 Service de Estatísticas do Aluno

```typescript
import { ObjectId } from 'mongodb';

interface StudentStatistics {
  userId: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
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
  dailyBreakdown: DailyStatistics[];
}

interface DailyStatistics {
  date: string;
  questionsAnswered: number;
  questionsCorrect: number;
  flashcardsAnswered: number;
  videosWatched: number;
  videosFinished: number;
  totalUsageInSeconds: number;
}

class StudentStatisticsService {
  constructor(
    private qbankInteractionModel: typeof QBankTestInteractionModel,
    private flashcardInteractionModel: typeof UserFlashCardInteractionModel,
    private videoDailyTrackerModel: typeof VideoDailyTrackerModel
  ) {}

  async getStatistics(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<StudentStatistics> {
    const [
      questionStats,
      flashcardStats,
      videoStats,
      dailyBreakdown
    ] = await Promise.all([
      this.getQuestionStats(userId, startDate, endDate),
      this.getFlashcardStats(userId, startDate, endDate),
      this.getVideoStats(userId, startDate, endDate),
      this.getDailyBreakdown(userId, startDate, endDate)
    ]);

    // Calcula tempo total de estudo
    const totalStudySeconds = dailyBreakdown.reduce(
      (sum, day) => sum + day.totalUsageInSeconds,
      0
    );
    const daysWithActivity = dailyBreakdown.filter(
      d => d.totalUsageInSeconds > 0
    ).length;

    return {
      userId,
      period: { startDate, endDate },
      questions: questionStats,
      flashcards: flashcardStats,
      videos: videoStats,
      studyTime: {
        totalSeconds: totalStudySeconds,
        totalHours: Number((totalStudySeconds / 3600).toFixed(2)),
        averageSecondsPerDay: daysWithActivity > 0 
          ? Math.round(totalStudySeconds / daysWithActivity) 
          : 0,
        averageHoursPerDay: daysWithActivity > 0 
          ? Number((totalStudySeconds / daysWithActivity / 3600).toFixed(2))
          : 0
      },
      dailyBreakdown
    };
  }

  private async getQuestionStats(userId: number, startDate: Date, endDate: Date) {
    const result = await this.qbankInteractionModel.aggregate([
      {
        $match: {
          userId,
          "deleted.isDeleted": false,
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          correct: { $sum: { $cond: ["$wasRight", 1, 0] } }
        }
      }
    ]);

    const stats = result[0] || { total: 0, correct: 0 };
    return {
      total: stats.total,
      correct: stats.correct,
      accuracyRate: stats.total > 0 
        ? Number(((stats.correct / stats.total) * 100).toFixed(2))
        : 0
    };
  }

  private async getFlashcardStats(userId: number, startDate: Date, endDate: Date) {
    const result = await this.flashcardInteractionModel.aggregate([
      {
        $match: {
          userId,
          "deleted.isDeleted": { $ne: true },
          updatedAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          score0: { $sum: { $cond: [{ $eq: ["$score", 0] }, 1, 0] } },
          score1: { $sum: { $cond: [{ $eq: ["$score", 1] }, 1, 0] } },
          score2: { $sum: { $cond: [{ $eq: ["$score", 2] }, 1, 0] } },
          score3: { $sum: { $cond: [{ $eq: ["$score", 3] }, 1, 0] } }
        }
      }
    ]);

    const stats = result[0] || { total: 0, score0: 0, score1: 0, score2: 0, score3: 0 };
    return {
      total: stats.total,
      scoreDistribution: {
        naoLembrei: stats.score0,
        dificil: stats.score1,
        bom: stats.score2,
        facil: stats.score3
      }
    };
  }

  private async getVideoStats(userId: number, startDate: Date, endDate: Date) {
    const result = await this.videoDailyTrackerModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDate, $lt: endDate }
        }
      },
      {
        $group: {
          _id: null,
          watched: { $sum: "$videosWatched" },
          finished: { $sum: "$videosFinished" },
          totalSeconds: { $sum: "$dailyTotalSecondsWatched" }
        }
      }
    ]);

    const stats = result[0] || { watched: 0, finished: 0, totalSeconds: 0 };
    return {
      watched: stats.watched,
      finished: stats.finished,
      totalSecondsWatched: stats.totalSeconds,
      totalHoursWatched: Number((stats.totalSeconds / 3600).toFixed(2))
    };
  }

  private async getDailyBreakdown(
    userId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<DailyStatistics[]> {
    // Implementação similar à função getStudentDailyStatistics
    // mostrada na seção 3.7
    // ...
  }
}
```

### 5.2 Índices Recomendados

Para melhor performance das queries, crie os seguintes índices:

```javascript
// Collection: qbank_test_interactions
db.qbank_test_interactions.createIndex(
  { userId: 1, updatedAt: 1 },
  { background: true }
);
db.qbank_test_interactions.createIndex(
  { userId: 1, "deleted.isDeleted": 1, updatedAt: 1 },
  { background: true }
);

// Collection: userflashcardinteractions
db.userflashcardinteractions.createIndex(
  { userId: 1, updatedAt: 1 },
  { background: true }
);
db.userflashcardinteractions.createIndex(
  { userId: 1, "deleted.isDeleted": 1, updatedAt: 1 },
  { background: true }
);

// Collection: video_daily_tracker
db.video_daily_tracker.createIndex(
  { userId: 1, date: 1 },
  { background: true }
);
```

---

## Resumo

| Métrica | Collection | Campo Principal | Cap de Tempo |
|---------|------------|-----------------|--------------|
| Questões | `qbank_test_interactions` | `wasRight` | 300s entre interações |
| Flashcards | `userflashcardinteractions` | `score` | 60s entre interações |
| Vídeos | `video_daily_tracker` | `dailyTotalSecondsWatched` | N/A (já calculado) |

### Fórmula do Tempo de Uso

```
Tempo = Σ min(CAP, (timestamp[i+1] - timestamp[i]) / 1000)
```

Onde:
- **CAP** = 300s para questões, 60s para flashcards
- Os timestamps são ordenados por `updatedAt`
- A divisão por 1000 converte de milissegundos para segundos

