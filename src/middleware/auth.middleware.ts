/** @format */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model";

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

export const authenticate = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const token = req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			res.status(401).json({ message: "No token, authorization denied" });
			return;
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET || "fallback-secret",
		) as any;
		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			res.status(401).json({ message: "Token is not valid" });
			return;
		}

		if (!user.isActive) {
			res.status(403).json({ message: "Account deactivated" });
			return;
		}

		req.user = user;
		next();
	} catch (error) {
		res.status(401).json({ message: "Token is not valid" });
	}
};

// Export legacy name for backward compatibility
export const authenticateToken = authenticate;

export const authorize = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.role)) {
			res.status(403).json({ message: "Access denied" });
			return;
		}
		next();
	};
};

// Export legacy name for backward compatibility
export const authorizeRoles = authorize;
