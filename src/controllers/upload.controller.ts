/** @format */

import { Request, Response } from "express";
import {
	uploadSingle,
	uploadMultiple,
	uploadImage,
	uploadDocument,
	deleteCloudinaryFile,
} from "../middleware/upload.middleware";

// Single file upload
export const uploadFile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		if (!req.file) {
			res.status(400).json({ message: "No file uploaded" });
			return;
		}

		const fileUrl = req.file.path;
		const fileInfo = {
			filename: req.file.filename,
			originalName: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			url: fileUrl,
		};

		res.json({
			message: "File uploaded successfully",
			file: fileInfo,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to upload file", error });
	}
};

// Multiple files upload
export const uploadFiles = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
			res.status(400).json({ message: "No files uploaded" });
			return;
		}

		const files = (req.files as Express.Multer.File[]).map((file) => ({
			filename: file.filename,
			originalName: file.originalname,
			mimetype: file.mimetype,
			size: file.size,
			url: file.path,
		}));

		res.json({
			message: "Files uploaded successfully",
			files,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to upload files", error });
	}
};

// Image upload
export const uploadImageFile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		if (!req.file) {
			res.status(400).json({ message: "No image uploaded" });
			return;
		}

		const imageUrl = req.file.path;
		const imageInfo = {
			filename: req.file.filename,
			originalName: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			url: imageUrl,
		};

		res.json({
			message: "Image uploaded successfully",
			image: imageInfo,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to upload image", error });
	}
};

// Document upload
export const uploadDocumentFile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		if (!req.file) {
			res.status(400).json({ message: "No document uploaded" });
			return;
		}

		const documentUrl = req.file.path;
		const documentInfo = {
			filename: req.file.filename,
			originalName: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			url: documentUrl,
		};

		res.json({
			message: "Document uploaded successfully",
			document: documentInfo,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to upload document", error });
	}
};

// Delete file
export const deleteFile = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { publicId } = req.params;

		if (!publicId) {
			res.status(400).json({ message: "Public ID is required" });
			return;
		}

		const result = await deleteCloudinaryFile(publicId);

		res.json({
			message: "File deleted successfully",
			result,
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to delete file", error });
	}
};

// Get file info
export const getFileInfo = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { publicId } = req.params;

		if (!publicId) {
			res.status(400).json({ message: "Public ID is required" });
			return;
		}

		// This would typically fetch file info from database or Cloudinary
		// For now, return a placeholder response
		res.json({
			message: "File info retrieved successfully",
			publicId,
			// Add more file information as needed
		});
	} catch (error) {
		res.status(500).json({ message: "Failed to get file info", error });
	}
};
