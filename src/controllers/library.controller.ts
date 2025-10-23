/** @format */

import { Request, Response } from "express";
import {
  Book,
  BookIssue,
  BookReservation,
  LibraryFine,
} from "../models/Library.model";
import { User } from "../models/User.model";

// Book Management
export const getAllBooks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, category, department } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (department) {
      query.department = department;
    }

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Book.countDocuments(query);

    res.json({
      books,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books", error });
  }
};

export const getBookById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch book", error });
  }
};

export const createBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const bookData = req.body;
    bookData.availableCopies = bookData.totalCopies;

    const book = await Book.create(bookData);

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create book", error });
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const book = await Book.findByIdAndUpdate(id, updateData, { new: true });

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update book", error });
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book", error });
  }
};

// Book Issue Management
export const issueBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, bookId, dueDate } = req.body;

    // Check if book is available
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      res.status(400).json({ message: "Book not available" });
      return;
    }

    // Check if student has any overdue books
    const overdueBooks = await BookIssue.find({
      student: studentId,
      status: "overdue",
    });

    if (overdueBooks.length > 0) {
      res.status(400).json({ message: "Student has overdue books" });
      return;
    }

    // Create book issue record - fixed user reference
    const bookIssue = await BookIssue.create({
      student: studentId,
      book: bookId,
      dueDate: new Date(dueDate),
      issuedBy: req.user?._id, // Use _id for MongoDB
    });

    // Update book availability
    await Book.findByIdAndUpdate(bookId, {
      $inc: { availableCopies: -1 },
    });

    res.status(201).json({
      message: "Book issued successfully",
      bookIssue,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to issue book", error });
  }
};

export const returnBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { issueId } = req.params;

    const bookIssue = await BookIssue.findById(issueId);
    if (!bookIssue) {
      res.status(404).json({ message: "Book issue record not found" });
      return;
    }

    // Update book issue record
    bookIssue.returnDate = new Date();
    bookIssue.status = "returned";
    await bookIssue.save();

    // Update book availability
    await Book.findByIdAndUpdate(bookIssue.book, {
      $inc: { availableCopies: 1 },
    });

    res.json({
      message: "Book returned successfully",
      bookIssue,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to return book", error });
  }
};

export const getStudentBooks = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    const query: any = { student: studentId };
    if (status) {
      query.status = status;
    }

    const bookIssues = await BookIssue.find(query)
      .populate("book", "title author isbn")
      .sort({ issueDate: -1 });

    res.json(bookIssues);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student books", error });
  }
};

// Book Reservation Management
export const reserveBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { studentId, bookId, expiryDate } = req.body;

    // Check if book is available
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies > 0) {
      res.status(400).json({ message: "Book is available for direct issue" });
      return;
    }

    // Check if student already has a reservation for this book
    const existingReservation = await BookReservation.findOne({
      student: studentId,
      book: bookId,
      status: "active",
    });

    if (existingReservation) {
      res
        .status(400)
        .json({ message: "Book already reserved by this student" });
      return;
    }

    const reservation = await BookReservation.create({
      student: studentId,
      book: bookId,
      expiryDate: new Date(expiryDate),
    });

    res.status(201).json({
      message: "Book reserved successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to reserve book", error });
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reservationId } = req.params;

    const reservation = await BookReservation.findByIdAndUpdate(
      reservationId,
      { status: "cancelled" },
      { new: true },
    );

    if (!reservation) {
      res.status(404).json({ message: "Reservation not found" });
      return;
    }

    res.json({
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel reservation", error });
  }
};

// Library Fine Management
export const calculateFine = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { issueId } = req.params;
    const { finePerDay = 5 } = req.body;

    const bookIssue = await BookIssue.findById(issueId);
    if (!bookIssue) {
      res.status(404).json({ message: "Book issue record not found" });
      return;
    }

    const today = new Date();
    const dueDate = new Date(bookIssue.dueDate);
    const daysOverdue = Math.max(
      0,
      Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
    );

    const fineAmount = daysOverdue * finePerDay;

    // Update book issue with fine amount
    bookIssue.fineAmount = fineAmount;
    if (daysOverdue > 0) {
      bookIssue.status = "overdue";
    }
    await bookIssue.save();

    // Create fine record if there's a fine
    if (fineAmount > 0) {
      await LibraryFine.create({
        student: bookIssue.student,
        bookIssue: issueId,
        amount: fineAmount,
        reason: "overdue",
        dueDate: today,
      });
    }

    res.json({
      daysOverdue,
      fineAmount,
      bookIssue,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate fine", error });
  }
};

export const payFine = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fineId } = req.params;

    const fine = await LibraryFine.findByIdAndUpdate(
      fineId,
      { status: "paid", paidDate: new Date() },
      { new: true },
    );

    if (!fine) {
      res.status(404).json({ message: "Fine record not found" });
      return;
    }

    // Update book issue fine amount to 0
    await BookIssue.findByIdAndUpdate(fine.bookIssue, { fineAmount: 0 });

    res.json({
      message: "Fine paid successfully",
      fine,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to pay fine", error });
  }
};

export const getStudentFines = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { studentId } = req.params;
    const { status } = req.query;

    const query: any = { student: studentId };
    if (status) {
      query.status = status;
    }

    const fines = await LibraryFine.find(query)
      .populate("bookIssue")
      .sort({ createdAt: -1 });

    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student fines", error });
  }
};