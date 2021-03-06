import { Schema, model } from "mongoose";

const doctorSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  yearsExperiences: {
    type: String,
    default: 0,
  },
  reviews: [
    {
      username: String,
      comment: String,
      score: Number,
    },
  ],
  specialties: [String],
  ubications: [String],
  imageNumber: Number,
  calendar: [
    {
      date: String,
      schedule: {
        time: String,
        patient: String,
        note: String,
        typeAppointment: String,
      },
    },
  ],
});

export const Doctor = model("Doctor", doctorSchema);
