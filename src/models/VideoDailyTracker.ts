import mongoose, { Schema, Document, Types } from 'mongoose';

interface IVideoDailyTrackerTag {
  tagId: Types.ObjectId;
  tagName: string;
  rootParentTagId: Types.ObjectId;
  rootParentTagName: string;
}

interface IVideoDailyTrackerTracker {
  videoId: Types.ObjectId;
  aqfmId: number;
  productId: number;
  blockNumber: number;
  progress: number[][];
  totalSecondsWatched: number;
  videoTotalSeconds: number;
  wasFinished: boolean;
  pings: number;
  lastSeenAt: Date;
  ips: string[];
  tags: IVideoDailyTrackerTag[];
}

export interface IVideoDailyTracker extends Document {
  userId: number;
  date: Date;
  trackers: IVideoDailyTrackerTracker[];
  dailyTotalSecondsWatched: number;
  videosWatched: number;
  videosFinished: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoDailyTrackerTagSchema = new Schema<IVideoDailyTrackerTag>(
  {
    tagId: { required: true, type: Schema.Types.ObjectId },
    tagName: { required: true, type: String },
    rootParentTagId: { required: true, type: Schema.Types.ObjectId },
    rootParentTagName: { required: true, type: String },
  },
  { _id: false }
);

const VideoDailyTrackerTrackerSchema = new Schema<IVideoDailyTrackerTracker>(
  {
    videoId: { required: true, type: Schema.Types.ObjectId },
    aqfmId: { required: true, type: Number },
    productId: { required: true, type: Number },
    blockNumber: { required: true, type: Number },
    progress: [[{ required: true, type: Number }]],
    totalSecondsWatched: { required: true, type: Number },
    videoTotalSeconds: { required: true, type: Number },
    wasFinished: { required: true, type: Boolean },
    pings: { required: true, type: Number },
    lastSeenAt: { required: true, type: Date },
    ips: [{ required: true, type: String }],
    tags: { required: true, type: [VideoDailyTrackerTagSchema] },
  },
  { _id: false }
);

const VideoDailyTrackerSchema = new Schema<IVideoDailyTracker>(
  {
    userId: { required: true, type: Number },
    date: { required: true, type: Date },
    trackers: { required: true, type: [VideoDailyTrackerTrackerSchema] },
    dailyTotalSecondsWatched: { required: true, type: Number },
    videosWatched: { required: true, type: Number },
    videosFinished: { required: true, type: Number },
  },
  { timestamps: true }
);

// Índices para performance
VideoDailyTrackerSchema.index({ userId: 1, date: 1 });

export default mongoose.models.video_daily_tracker ||
  mongoose.model<IVideoDailyTracker>('video_daily_tracker', VideoDailyTrackerSchema);

