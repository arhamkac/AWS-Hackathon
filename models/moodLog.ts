import mongoose, { Document, Schema, Types, models, model } from "mongoose";

export interface ICheckInAnswers {
  sleep_hours: number;
  sleep_quality: number;
  mood_now: number;
  stress_slider: number;
  stress_context: string;
  classes_today: number;
  last_break: number;
  physical_state: number;
  exercise: number;
  nutrition: number;
  social: number;
  feedback: string;
  assignments: Array<{
    name: string;
    subject: string;
    difficulty: string;
    hoursLeft: string;
    dueWhen: string;
    percentDone: number;
  }>;
}

export interface IDailySnapshot {
  sleepHours: number;      // raw val from choice (5–100)
  sleepQuality: number;    // raw val
  stressSlider: number;    // 0–100
  moodNow: number;         // raw val
  exercise: number;        // raw val
  nutrition: number;       // raw val
  social: number;          // raw val
  assignmentCount: number; // # of assignments entered
  pendingHours: number;    // sum of hoursLeft for incomplete assignments
}

export interface IMoodLog extends Document {
  userId: Types.ObjectId;
  answers: ICheckInAnswers;
  dailySnapshot: IDailySnapshot;
  scores: {
    stress: number;
    burnout: number;
    anxiety: number;
    sleep: number;
    wellbeing: number;
  };
  aiResponse: string;
  // User feedback on AI response (for retraining)
  userFeedback?: {
    helpful: boolean;
    accuracyRating: number; // 1-5
    note?: string;
  };
  createdAt: Date;
}

const moodLogSchema = new Schema<IMoodLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: Schema.Types.Mixed, required: true },
    dailySnapshot: {
      sleepHours:      { type: Number, default: 0 },
      sleepQuality:    { type: Number, default: 0 },
      stressSlider:    { type: Number, default: 0 },
      moodNow:         { type: Number, default: 0 },
      exercise:        { type: Number, default: 0 },
      nutrition:       { type: Number, default: 0 },
      social:          { type: Number, default: 0 },
      assignmentCount: { type: Number, default: 0 },
      pendingHours:    { type: Number, default: 0 },
    },
    scores: {
      stress:    { type: Number, required: true },
      burnout:   { type: Number, required: true },
      anxiety:   { type: Number, required: true },
      sleep:     { type: Number, required: true },
      wellbeing: { type: Number, required: true },
    },
    aiResponse: { type: String, required: true },
    userFeedback: {
      helpful:        { type: Boolean },
      accuracyRating: { type: Number, min: 1, max: 5 },
      note:           { type: String },
    },
  },
  { timestamps: true }
);

// Index for fast history queries
moodLogSchema.index({ userId: 1, createdAt: -1 });

export default models.MoodLog || model<IMoodLog>("MoodLog", moodLogSchema);
