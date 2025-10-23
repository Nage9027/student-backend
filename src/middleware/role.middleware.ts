/** @format */

import { Request, Response, NextFunction } from "express";

export const requireRole = (allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const userRole = req.user?.role;

		if (!userRole) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		if (!allowedRoles.includes(userRole)) {
			return res.status(403).json({
				message: "Access denied. Insufficient permissions.",
			});
		}

		next();
	};
};
