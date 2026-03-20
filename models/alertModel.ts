import mongoose, { Document, Schema, Types, models, model } from "mongoose";

export type AlertSeverity = "warning" | "critical" | "emergency";
export type AlertStatus   = "pending" | "reviewed" | "resolved";

export interface IAlert extends Document {
  studentId:    Types.ObjectId;
  universityId: Types.ObjectId;
  severity:     AlertSeverity;
  scores: {
    stress:    number;
    burnout:   number;
    anxiety:   number;
    wellbeing: number;
  };
  summary:      string;   // AI-generated summary for the university
  studentName:  string;   // denormalised for quick display
  studentRoll:  string;
  studentBranch: string;
  status:       AlertStatus;
  reviewNote?:  string;   // counsellor's note after review
  createdAt:    Date;
  updatedAt:    Date;
}

const alertSchema = new Schema<IAlert>(
  {
    studentId:     { type: Schema.Types.ObjectId, ref: "User",       required: true },
    universityId:  { type: Schema.Types.ObjectId, ref: "University", required: true },
    severity:      { type: String, enum: ["warning", "critical", "emergency"], required: true },
    scores: {
      stress:    { type: Number, required: true },
      burnout:   { type: Number, required: true },
      anxiety:   { type: Number, required: true },
      wellbeing: { type: Number, required: true },
    },
    summary:       { type: String, required: true },
    studentName:   { type: String, required: true },
    studentRoll:   { type: String, required: true },
    studentBranch: { type: String, default: "Unknown" },
    status:        { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
    reviewNote:    { type: String },
  },
  { timestamps: true }
);

alertSchema.index({ universityId: 1, createdAt: -1 });
alertSchema.index({ studentId: 1, createdAt: -1 });

export default models.Alert || model<IAlert>("Alert", alertSchema);
