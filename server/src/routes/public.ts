import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/content", async (_req, res) => {
  const content = await prisma.siteContent.findUnique({ where: { id: 1 } });
  return res.json(content);
});

export default router;
