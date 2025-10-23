/** @format */

import { IPaginationQuery } from "../types/common";

interface PaginationParams {
	page: number;
	limit: number;
	skip: number;
}

export const getPaginationParams = (
	query: IPaginationQuery,
): PaginationParams => {
	const page = parseInt((query.page as string) || "1", 10);
	const limit = parseInt((query.limit as string) || "10", 10);
	const skip = (page - 1) * limit;

	return { page, limit, skip };
};
