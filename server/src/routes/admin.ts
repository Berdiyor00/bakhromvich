import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAdmin, requireAuth } from "../middleware/auth";

const router = Router();

const contentSchema = z.object({
  companyName: z.string().min(2),
  heroTitle: z.string().min(2),
  heroSubtitle: z.string().min(2),
  heroVideoUrl: z.string().min(1),
  aboutTitle: z.string().min(2),
  aboutText: z.string().min(10),
  servicesJson: z.string(),
  galleryJson: z.string(),
  testimonialsJson: z.string(),
  contactPhone: z.string().min(5),
  contactEmail: z.string().email(),
  contactAddress: z.string().min(5)
});

router.use(requireAuth, requireAdmin);

router.get("/content", async (_req, res) => {
  const content = await prisma.siteContent.findUnique({ where: { id: 1 } });
  res.json(content);
});

router.put("/content", async (req, res) => {
  const parse = contentSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ message: "Invalid content payload" });
  }

  const updated = await prisma.siteContent.upsert({
    where: { id: 1 },
    create: { id: 1, ...parse.data },
    update: parse.data
  });

  res.json(updated);
});

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  res.json(users);
});

export default router;
