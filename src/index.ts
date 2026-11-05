import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import eventRoutes from "./routes/events";

const app = express();
const port = process.env.PORT || 8000;
const origins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Ushnota API is running" });
});

app.use("/api/events", eventRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

connectDB()
  .then(async (db) => {
    await db
      .collection("joins")
      .createIndex({ eventId: 1, userEmail: 1 }, { unique: true });
    await db.collection("events").createIndex({ eventDate: 1 });
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
