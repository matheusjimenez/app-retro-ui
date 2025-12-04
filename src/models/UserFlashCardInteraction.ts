import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserFlashCardInteraction extends Document {
  userId: number | Types.ObjectId;
  flashCardId: Types.ObjectId;
  flashCardStackId: Types.ObjectId;
  score: number; // 0-3: não lembrei, difícil, bom, fácil
  timeInSeconds: number;
  ease: number;
  repetition: number;
  intervalInMinutes: number;
  intervalDate: Date;
  deleted: {
    isDeleted: boolean;
    deletedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserFlashCardInteractionSchema = new Schema<IUserFlashCardInteraction>(
  {
    userId: { ref: 'users', type: Schema.Types.Mixed },
    flashCardId: { ref: 'flashcards', type: Schema.Types.ObjectId },
    flashCardStackId: { ref: 'userflashcardstacks', type: Schema.Types.ObjectId },
    score: { type: Number },
    timeInSeconds: { type: Number },
    ease: { type: Number },
    repetition: { type: Number },
    intervalInMinutes: { type: Number },
    intervalDate: { type: Date },
    deleted: {
      isDeleted: { type: Boolean, default: false },
      deletedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Índices para performance
UserFlashCardInteractionSchema.index({ userId: 1, updatedAt: 1 });
UserFlashCardInteractionSchema.index({ userId: 1, 'deleted.isDeleted': 1, updatedAt: 1 });

export default mongoose.models.userflashcardinteractions ||
  mongoose.model<IUserFlashCardInteraction>('userflashcardinteractions', UserFlashCardInteractionSchema);

