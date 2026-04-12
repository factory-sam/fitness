import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "email",
      "user_id",
      "*.password",
      "*.email",
      "*.token",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
  ...(process.env.NODE_ENV === "development"
    ? { transport: { target: "pino-pretty", options: { colorize: true } } }
    : {}),
});

export default logger;
