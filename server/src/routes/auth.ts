import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { AuthRequest, requireAuth } from "../middleware/auth";

const router = Router();

const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]).optional()
});

router.post("/register", async (req, res) => {
  const parse = authSchema.safeParse(req.body);
  if (!parse.success || !parse.data.name) {
    return res.status(400).json({ message: "Invalid registration data" });
  }

  const { name, email, password, role } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role ?? "USER" }
  });

  const normalizedRole = user.role === "ADMIN" ? "ADMIN" : "USER";
  const token = signToken({ userId: user.id, role: normalizedRole });
  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: normalizedRole }
  });
});

router.post("/login", async (req, res) => {
  const parse = authSchema.omit({ name: true }).safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid login data" });
  }

  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const role = user.role === "ADMIN" ? "ADMIN" : "USER";
  const token = signToken({ userId: user.id, role });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role }
  });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });

  return res.json(user);
});

export default router;
