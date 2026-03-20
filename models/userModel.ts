import mongoose, { Document, Schema, models, model } from "mongoose";

// Academic profile interface
export interface IAcademicProfile {
  university: string;
  branch: string;
  semester: string;
  currentCGPA: number;
  rollNumber: string;
  year?: number;
}

// User goals and achievements
export interface IUserGoals {
  selectedGoals: string[];
  completedAchievements: string[];
  extraContext?: string;
}

export interface IUser extends Document {
  // Basic info
  name: string;
  email: string;
  password?: string;
  firebaseUID?: string;
  
  // Profile completion
  isProfileComplete: boolean;
  profileCompletedAt?: Date;
  
  // Academic details
  academic: IAcademicProfile;
  
  // Goals and achievements
  goals: IUserGoals;

  // Authentication method
  authProvider: 'email' | 'google' | 'facebook';
  
  // Profile settings
  isActive: boolean;
  lastLoginAt?: Date;
}

const academicSchema = new Schema<IAcademicProfile>({
  university:  { type: String, required: true },
  branch:      { type: String, required: true },
  semester:    { type: String, required: true },
  currentCGPA: { type: Number, required: true, min: 0, max: 10 },
  rollNumber:  { type: String, required: true },
  year:        { type: Number }
}, { _id: false });

const goalsSchema = new Schema<IUserGoals>({
  selectedGoals: [{ type: String }],
  completedAchievements: [{ type: String }],
  extraContext: { type: String }
}, { _id: false });

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: false
    },
    firebaseUID: {
      type: String,
      unique: true,
      sparse: true
    },
    isProfileComplete: {
      type: Boolean,
      default: false
    },
    profileCompletedAt: {
      type: Date
    },
    academic: {
      type: academicSchema,
      required: false
    },
    goals: {
      type: goalsSchema,
      required: false
    },
    authProvider: {
      type: String,
      enum: ['email', 'google', 'facebook'],
      default: 'email'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export default models.User || model<IUser>("User", userSchema);