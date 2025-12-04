import mongoose, { Schema, Document } from 'mongoose';

export interface IQBankTestInteraction extends Document {
  userId: number;
  questionId: mongoose.Types.ObjectId;
  answerId: mongoose.Types.ObjectId;
  wasRight: boolean;
  wasNulledQuestion: boolean;
  testMode: 'study' | 'test' | 'ranked';
  isRankedTest: boolean;
  prebuiltTestId?: mongoose.Types.ObjectId;
  deleted: {
    isDeleted: boolean;
    deletedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QBankTestInteractionSchema = new Schema<IQBankTestInteraction>(
  {
    userId: { required: true, type: Number },
    questionId: { required: true, type: Schema.Types.ObjectId, ref: 'qbank_questions' },
    answerId: { required: true, type: Schema.Types.ObjectId },
    wasRight: { required: true, type: Boolean },
    wasNulledQuestion: { required: true, type: Boolean },
    testMode: { required: true, type: String, enum: ['study', 'test', 'ranked'] },
    isRankedTest: { required: true, type: Boolean },
    prebuiltTestId: { type: Schema.Types.ObjectId, ref: 'qbank_prebuilt_tests' },
    deleted: {
      isDeleted: { type: Boolean, default: false },
      deletedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Índices para performance
QBankTestInteractionSchema.index({ userId: 1, updatedAt: 1 });
QBankTestInteractionSchema.index({ userId: 1, 'deleted.isDeleted': 1, updatedAt: 1 });

export default mongoose.models.qbank_test_interactions ||
  mongoose.model<IQBankTestInteraction>('qbank_test_interactions', QBankTestInteractionSchema);

