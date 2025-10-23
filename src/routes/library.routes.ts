/** @format */

import { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getStudentBooks,
  reserveBook,
  cancelReservation,
  calculateFine,
  payFine,
  getStudentFines,
} from "../controllers/library.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Book Management Routes
router.get("/books", authenticate, getAllBooks);
router.get("/books/:id", authenticate, getBookById);
router.post(
  "/books",
  authenticate,
  authorize("admin", "librarian"),
  createBook,
);
router.put(
  "/books/:id",
  authenticate,
  authorize("admin", "librarian"),
  updateBook,
);
router.delete(
  "/books/:id",
  authenticate,
  authorize("admin", "librarian"),
  deleteBook,
);

// Book Issue Routes
router.post(
  "/issue",
  authenticate,
  authorize("admin", "librarian"),
  issueBook,
);
router.put(
  "/return/:issueId",
  authenticate,
  authorize("admin", "librarian"),
  returnBook,
);
router.get("/student/:studentId/books", authenticate, getStudentBooks);

// Book Reservation Routes
router.post("/reserve", authenticate, reserveBook);
router.put(
  "/reserve/:reservationId/cancel",
  authenticate,
  cancelReservation,
);

// Library Fine Routes
router.post(
  "/fines/calculate/:issueId",
  authenticate,
  authorize("admin", "librarian"),
  calculateFine,
);
router.put("/fines/:fineId/pay", authenticate, payFine);
router.get("/student/:studentId/fines", authenticate, getStudentFines);

export default router;