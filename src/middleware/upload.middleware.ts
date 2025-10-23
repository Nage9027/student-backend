/** @format */

import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "cms-uploads",
		allowed_formats: [
			"jpg",
			"jpeg",
			"png",
			"gif",
			"pdf",
			"doc",
			"docx",
			"xls",
			"xlsx",
			"ppt",
			"pptx",
		],
		transformation: [
			{ width: 1000, height: 1000, crop: "limit" }, // Resize images
			{ quality: "auto" }, // Auto quality
		],
	},
});

// Local storage configuration (fallback)
const localStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
		);
	},
});

const fileFilter = (req: any, file: any, cb: any) => {
	const allowedMimeTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	];

	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				"File type not allowed. Allowed types: images, PDF, Word, Excel, PowerPoint",
			),
			false,
		);
	}
};

// Use Cloudinary if configured, otherwise use local storage
const storage = process.env.CLOUDINARY_CLOUD_NAME
	? cloudinaryStorage
	: localStorage;

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

// Single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple files upload
export const uploadMultiple = (fieldName: string, maxCount: number = 5) =>
	upload.array(fieldName, maxCount);

// Specific field uploads
export const uploadFields = (fields: { name: string; maxCount: number }[]) =>
	upload.fields(fields);

// Image upload only
export const uploadImage = multer({
	storage,
	fileFilter: (req: any, file: any, cb: any) => {
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed"), false);
		}
	},
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit for images
	},
});

// Document upload only
export const uploadDocument = multer({
	storage,
	fileFilter: (req: any, file: any, cb: any) => {
		const allowedMimeTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"application/vnd.ms-powerpoint",
			"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		];

		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					"Only document files (PDF, Word, Excel, PowerPoint) are allowed",
				),
				false,
			);
		}
	},
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit for documents
	},
});

// Helper function to delete file from Cloudinary
export const deleteCloudinaryFile = async (publicId: string) => {
	try {
		const result = await cloudinary.uploader.destroy(publicId);
		return result;
	} catch (error) {
		console.error("Error deleting file from Cloudinary:", error);
		throw error;
	}
};

// Helper function to get file URL from Cloudinary
export const getCloudinaryUrl = (publicId: string, options: any = {}) => {
	return cloudinary.url(publicId, options);
};
