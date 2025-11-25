import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";

/* ROUTE IMPORTS */
import projectRoutes from "./routes/projectRoutes";
import taskRoutes from "./routes/taskRoutes";
import searchRoutes from "./routes/searchRoutes";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";
import authRoutes from "./routes/authRoutes";
import aiRoutes from "./routes/aiRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3001",
    credentials: true,
  })
);
app.use(cookieParser());

const prisma = new PrismaClient();

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use("/auth", authRoutes);
app.use("/ai", aiRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("SIGINT received. Closing Prisma client.");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing Prisma client.");
  await prisma.$disconnect();
  process.exit(0);
});
