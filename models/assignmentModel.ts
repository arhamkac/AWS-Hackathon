import mongoose, { Document, Schema, Types } from "mongoose";

export interface IAssignment extends Document {
  userId: Types.ObjectId;
  title: string;
  subject?: string;
  deadline: Date;
  estimatedHours?: number;
  status: "pending" | "completed";
}

const assignmentSchema = new Schema<IAssignment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique:true,
    },

    title: {
      type: String,
      required: true,
    },

    subject: String,

    deadline: {
      type: Date,
      required: true,
    },

    estimatedHours: Number,

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>("Assignment", assignmentSchema);