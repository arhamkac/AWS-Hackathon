import mongoose, { Document, Schema, models, model } from "mongoose";

export interface IUniversity extends Document {
  name: string;
  code: string;           // short unique code e.g. "IITK"
  contactEmail: string;   // admin login email
  password: string;       // hashed
  emailDomain?: string;   // e.g. "iitk.ac.in" — auto-link students
  departments: string[];
  createdAt: Date;
}

const universitySchema = new Schema<IUniversity>(
  {
    name:          { type: String, required: true, trim: true },
    code:          { type: String, required: true, unique: true, uppercase: true, trim: true },
    contactEmail:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true },
    emailDomain:   { type: String, lowercase: true, trim: true },
    departments:   [{ type: String }],
  },
  { timestamps: true }
);

export default models.University || model<IUniversity>("University", universitySchema);
