import jwt from "jsonwebtoken";
import { config } from "../config";

export interface JwtPayload {
  userId: number;
  role: "ADMIN" | "USER";
}

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};
