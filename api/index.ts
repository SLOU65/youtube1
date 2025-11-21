import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { getSessionCookieOptions } from "../server/_core/cookies";
import { COOKIE_NAME } from "../shared/const";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// tRPC endpoint
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve static files
app.use(express.static("dist"));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile("dist/index.html", { root: "." });
});

export default app;
