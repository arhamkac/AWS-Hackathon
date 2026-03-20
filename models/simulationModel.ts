import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISimulation extends Document {
  userId: Types.ObjectId;
  inputState: Record<string, any>;
  predictedRisk: number;
  suggestion?: string;
}

const simulationSchema = new Schema<ISimulation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inputState: {
      type: Schema.Types.Mixed,
      required: true,
    },

    predictedRisk: Number,

    suggestion: String,
  },
  { timestamps: true }
);

export default mongoose.model<ISimulation>(
  "Simulation",
  simulationSchema
);