import mongoose from 'mongoose';
import { connectToDatabase } from './mongodb';

// Período fixo: 1 de janeiro a 31 de dezembro de 2025
const START_DATE = new Date('2025-01-01T00:00:00.000Z');
const END_DATE = new Date('2025-12-31T23:59:59.999Z');

// Timezone para formatação de datas
const TIMEZONE = 'America/Sao_Paulo';

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
  peakDay?: {
    date: string;
    hours: number;
  };
}

/**
 * Busca estatísticas de flashcards de um usuário
 * Collection: userflashcardinteractions
 */
export async function getFlashcardStats(userId: number): Promise<FlashcardStats> {
  const conn = await connectToDatabase();
  
  if (!conn) {
    return {
      total: 0,
      scoreDistribution: { naoLembrei: 0, dificil: 0, bom: 0, facil: 0 },
    };
  }

  const db = conn.connection.db;
  if (!db) {
    return {
      total: 0,
      scoreDistribution: { naoLembrei: 0, dificil: 0, bom: 0, facil: 0 },
    };
  }
  
  const collection = db.collection('userflashcardinteractions');

  // Usando trusted para o pipeline de agregação
  const pipeline = mongoose.trusted([
    {
      $match: {
        userId: userId,
        'deleted.isDeleted': { $ne: true },
        updatedAt: { $gte: START_DATE, $lte: END_DATE },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        score0: { $sum: { $cond: [{ $eq: ['$score', 0] }, 1, 0] } },
        score1: { $sum: { $cond: [{ $eq: ['$score', 1] }, 1, 0] } },
        score2: { $sum: { $cond: [{ $eq: ['$score', 2] }, 1, 0] } },
        score3: { $sum: { $cond: [{ $eq: ['$score', 3] }, 1, 0] } },
      },
    },
  ]);

  const result = await collection.aggregate(pipeline).toArray();

  if (!result || result.length === 0) {
    return {
      total: 0,
      scoreDistribution: { naoLembrei: 0, dificil: 0, bom: 0, facil: 0 },
    };
  }

  const stats = result[0];
  return {
    total: stats.total || 0,
    scoreDistribution: {
      naoLembrei: stats.score0 || 0,
      dificil: stats.score1 || 0,
      bom: stats.score2 || 0,
      facil: stats.score3 || 0,
    },
  };
}

/**
 * Busca estatísticas de vídeos de um usuário
 * Collection: video_daily_tracker
 */
export async function getVideoStats(userId: number): Promise<VideoStats> {
  const conn = await connectToDatabase();
  
  if (!conn) {
    return {
      watched: 0,
      finished: 0,
      totalSecondsWatched: 0,
      totalHoursWatched: 0,
    };
  }

  const db = conn.connection.db;
  if (!db) {
    return {
      watched: 0,
      finished: 0,
      totalSecondsWatched: 0,
      totalHoursWatched: 0,
    };
  }
  
  const collection = db.collection('video_daily_tracker');

  // Pipeline para totais usando trusted
  const totalsPipeline = mongoose.trusted([
    {
      $match: {
        userId: userId,
        date: { $gte: START_DATE, $lt: END_DATE },
      },
    },
    {
      $group: {
        _id: null,
        totalVideosWatched: { $sum: '$videosWatched' },
        totalVideosFinished: { $sum: '$videosFinished' },
        totalSecondsWatched: { $sum: '$dailyTotalSecondsWatched' },
      },
    },
  ]);

  // Pipeline para encontrar o dia de pico usando trusted
  const peakDayPipeline = mongoose.trusted([
    {
      $match: {
        userId: userId,
        date: { $gte: START_DATE, $lt: END_DATE },
      },
    },
    {
      $project: {
        date: {
          $dateToString: {
            date: '$date',
            format: '%Y-%m-%d',
            timezone: TIMEZONE,
          },
        },
        secondsWatched: '$dailyTotalSecondsWatched',
      },
    },
    {
      $sort: { secondsWatched: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  const [totalsResult, peakDayResult] = await Promise.all([
    collection.aggregate(totalsPipeline).toArray(),
    collection.aggregate(peakDayPipeline).toArray(),
  ]);

  const totals = totalsResult[0] || {
    totalVideosWatched: 0,
    totalVideosFinished: 0,
    totalSecondsWatched: 0,
  };

  const totalHours = Number((totals.totalSecondsWatched / 3600).toFixed(1));

  const result: VideoStats = {
    watched: totals.totalVideosWatched || 0,
    finished: totals.totalVideosFinished || 0,
    totalSecondsWatched: totals.totalSecondsWatched || 0,
    totalHoursWatched: totalHours,
  };

  // Adiciona o dia de pico se existir
  if (peakDayResult && peakDayResult.length > 0) {
    const peakDay = peakDayResult[0];
    result.peakDay = {
      date: peakDay.date,
      hours: Number((peakDay.secondsWatched / 3600).toFixed(1)),
    };
  }

  return result;
}

/**
 * Calcula o tempo total de estudo (questões + flashcards + vídeos)
 * - Questões: calculado pela diferença entre timestamps (cap de 300s por intervalo)
 * - Flashcards: calculado pela diferença entre timestamps (cap de 60s por intervalo)
 * - Vídeos: já vem calculado no dailyTotalSecondsWatched
 */
export async function getTotalStudyTime(
  userId: number,
  questionTimeSeconds: number = 0
): Promise<{ totalSeconds: number; totalHours: number }> {
  const conn = await connectToDatabase();
  
  if (!conn) {
    return { totalSeconds: 0, totalHours: 0 };
  }

  const db = conn.connection.db;
  if (!db) {
    return { totalSeconds: 0, totalHours: 0 };
  }

  // Busca tempo de flashcards (usando timestamps consecutivos com cap de 60s)
  const flashcardCollection = db.collection('userflashcardinteractions');
  
  const flashcardTimePipeline = mongoose.trusted([
    {
      $match: {
        userId: userId,
        'deleted.isDeleted': { $ne: true },
        updatedAt: { $gte: START_DATE, $lte: END_DATE },
      },
    },
    { $sort: { updatedAt: 1 } },
    {
      $group: {
        _id: {
          $dateToString: {
            date: '$updatedAt',
            format: '%Y-%m-%d',
            timezone: TIMEZONE,
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
                      inputs: [
                        '$times',
                        { $slice: ['$times', 1, { $size: '$times' }] },
                      ],
                    },
                  },
                  as: 'pair',
                  in: {
                    // Cap de 60 segundos para flashcards
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
                          1000, // Converter de ms para segundos
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
  ]);

  const flashcardTimeResult = await flashcardCollection
    .aggregate(flashcardTimePipeline)
    .toArray();

  const flashcardTotalSeconds = flashcardTimeResult.reduce(
    (sum, day) => sum + (day.totalTimeInSeconds || 0),
    0
  );

  // Busca tempo de vídeos (já calculado)
  const videoCollection = db.collection('video_daily_tracker');
  
  const videoTimePipeline = mongoose.trusted([
    {
      $match: {
        userId: userId,
        date: { $gte: START_DATE, $lt: END_DATE },
      },
    },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: '$dailyTotalSecondsWatched' },
      },
    },
  ]);

  const videoTimeResult = await videoCollection
    .aggregate(videoTimePipeline)
    .toArray();

  const videoTotalSeconds = videoTimeResult[0]?.totalSeconds || 0;

  // Soma total
  const totalSeconds = questionTimeSeconds + flashcardTotalSeconds + videoTotalSeconds;
  const totalHours = Number((totalSeconds / 3600).toFixed(1));

  return { totalSeconds, totalHours };
}

/**
 * Busca todas as estatísticas de estudo de um usuário
 */
export async function getAllStudyStats(
  userId: number,
  questionTimeSeconds: number = 0
): Promise<{
  flashcards: FlashcardStats;
  videos: VideoStats;
  totalStudyHours: number;
}> {
  const [flashcards, videos, studyTime] = await Promise.all([
    getFlashcardStats(userId),
    getVideoStats(userId),
    getTotalStudyTime(userId, questionTimeSeconds),
  ]);

  return {
    flashcards,
    videos,
    totalStudyHours: studyTime.totalHours,
  };
}

