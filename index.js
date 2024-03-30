import express from "express";
const app = express();

import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import "express-async-errors";

import morgan from "morgan";

import connectDB from "./db/connect.js";

import authRouter from "./routes/authRoutes.js";
import jobsRouter from "./routes/jobsRoutes.js";

import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authenticateUser from "./middleware/authenticate.js";

import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import cookieParser from "cookie-parser";
import { handleReminder} from "./controllers/reminderController.js";
import {
  resetPassword,
  verifyOTP,
  forgotPassword,
} from "./controllers/passwordController.js";

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.resolve(__dirname, "./client/build")));

app.use(cors({ origin: "https://job-tracking-client.vercel.app", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(helmet());
app.use(mongoSanitize());

app.get("/api/v1", (req, res) => {
  res.send("Hello");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

app.post("/api/v1/remind", handleReminder);


app.post("/api/v1/forgotpassword", forgotPassword);
app.post("/api/v1/resetpassword", resetPassword);
app.post("/api/v1/verifyotp", verifyOTP);

app.get("*", function (request, response) {
  response.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
