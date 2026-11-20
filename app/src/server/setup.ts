import express from "express";
import { rateLimit } from "express-rate-limit";
import { prisma, type MiddlewareConfigFn } from "wasp/server";
import type { Health } from "wasp/server/api";
export const middleware: MiddlewareConfigFn = (config) => {
  config.delete("logger");
  config.set("registrationGate", (req, res, next) => {
    if (
      process.env.REGISTRATION_ENABLED !== "true" &&
      req.method === "POST" &&
      /signup|request-password-reset/.test(req.path)
    ) {
      res.status(403).json({ message: "REGISTRATION_CLOSED" });
      return;
    }
    next();
  });
  config.set("express.json", express.json({ limit: "15mb" }));
  config.set(
    "rateLimit",
    rateLimit({
      windowMs: 60000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  const sensitive = rateLimit({
    windowMs: 60000,
    limit: 12,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  });
  config.set("sensitiveLimit", (req, res, next) =>
    req.method === "POST" && /auth|contact/.test(req.path)
      ? sensitive(req, res, next)
      : next(),
  );
  return config;
};
export const health: Health = async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      app: "bakalio",
      ai: "disabled",
      payments: "disabled",
    });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
};
