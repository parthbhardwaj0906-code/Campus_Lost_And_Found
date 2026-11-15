import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import itemRoutes from "./routes/item.routes.js";
import claimRoutes from "./routes/claim.routes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// Matches your per-deployment Vercel URLs, e.g.
// https://frontend-b033o133p-parth-projects620.vercel.app
const vercelDeploymentPattern =
  /^https:\/\/frontend-[a-z0-9]+-parth-projects620\.vercel\.app$/;

app.use("/uploads", express.static(path.resolve("uploads")));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        vercelDeploymentPattern.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Campus Lost & Found API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;