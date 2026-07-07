import { Router } from "express";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/media", requireAuth, requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.status(201).json({ url: fileUrl });
});

export default router;
