import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { syncDrive, listFiles, getProgress, retryFile, getChunkContext } from "../controllers/drive.controller.js";

const router: Router = Router();

router.post("/sync", requireAuth, syncDrive);
router.get("/files", requireAuth, listFiles);
router.get("/progress", requireAuth, getProgress);
router.post("/files/:fileId/retry", requireAuth, retryFile);
router.get("/chunk/:chunkId", requireAuth, getChunkContext);

export default router;
