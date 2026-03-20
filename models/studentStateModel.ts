import mongoose, { Document, Schema, Types } from "mongoose";

export interface IStudentState extends Document {
  userId: Types.ObjectId;
  sleepHours: number;
  studyHours: number;
  assignmentsDue: number;
  mood: string;
  stressLevel: number;
  burnoutRisk: number;
  focusScore: number;
}

const studentStateSchema = new Schema<IStudentState>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    sleepHours: Number,

    studyHours: Number,

    assignmentsDue: Number,

    mood: String,

    stressLevel: Number,

    burnoutRisk: Number,

    focusScore: Number,
  },
  { timestamps: true }
);

export default mongoose.model<IStudentState>(
  "StudentState",
  studentStateSchema
);