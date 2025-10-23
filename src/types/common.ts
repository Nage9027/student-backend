/** @format */

import { Request } from "express";
import { ParsedQs } from "qs";

// Pagination query interface
export interface IPaginationQuery extends ParsedQs {
	page?: string;
	limit?: string;
	search?: string;
	department?: string;
	semester?: string;
	academicYear?: string;
	status?: string;
	studentId?: string;
	[key: string]: string | undefined | string[];
}

// Extended Request with typed query
export interface IPaginatedRequest extends Request {
	query: IPaginationQuery;
}
