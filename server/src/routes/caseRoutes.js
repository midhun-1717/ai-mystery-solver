import { Router } from "express";
import { createCase, getCase, discoverClue, requestHint, accuse, getResult } from "../controllers/caseController.js";

const router = Router();
router.post("/", createCase);
router.get("/:id", getCase);
router.post("/:id/clues/:clueId/discover", discoverClue);
router.post("/:id/hints", requestHint);
router.post("/:id/accuse", accuse);
router.get("/:id/result", getResult);

export default router;