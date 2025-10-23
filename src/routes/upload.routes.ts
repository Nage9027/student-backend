/** @format */

import { Router } from "express";
import {
	uploadFile,
	uploadFiles,
	uploadImageFile,
	uploadDocumentFile,
	deleteFile,
	getFileInfo,
} from "../controllers/upload.controller";
import {
	uploadSingle,
	uploadMultiple,
	uploadImage,
	uploadDocument,
} from "../middleware/upload.middleware";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// File upload routes
router.post("/single", authenticateToken, uploadSingle("file"), uploadFile);
router.post(
	"/multiple",
	authenticateToken,
	uploadMultiple("files", 10),
	uploadFiles,
);
router.post(
	"/image",
	authenticateToken,
	uploadImage.single("image"),
	uploadImageFile,
);
router.post(
	"/document",
	authenticateToken,
	uploadDocument.single("document"),
	uploadDocumentFile,
);

// File management routes
router.delete("/:publicId", authenticateToken, deleteFile);
router.get("/:publicId/info", authenticateToken, getFileInfo);

export default router;
