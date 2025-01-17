import mongoose from "mongoose";

const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide company"],
      maxLength: 50,
    },
    position: {
      type: String,
      required: [true, "Please provide position"],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["pending", "interview", "extended", "declined"],
      default: "pending",
    },
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship"],
      default: "full-time",
    },
    jobLocation: {
      type: String,
      default: "my city",
      required: true,
    },
    jobLink: {
      type: String,
    },
    jobDescription: {
      type: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide the User"],
    },
    isReferral: {
      type: Boolean,
      default: false,
    },
    isRecruiterCall: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
