import dotenv from "dotenv";

dotenv.config();

const parseOrigins = (value: string | undefined) => {
  if (!value) return ["http://localhost:5173"];

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const config = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  allowedOrigins: parseOrigins(process.env.CORS_ORIGIN || process.env.CLIENT_URL)
};
