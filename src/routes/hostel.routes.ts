/** @format */

import { Router } from "express";
import {
  getAllHostels,
  createHostel,
  updateHostel,
  getHostelRooms,
  createRoom,
  updateRoom,
  allocateHostel,
  checkIn,
  checkOut,
  getStudentAllocations,
  makeHostelPayment,
  getHostelPayments,
} from "../controllers/hostel.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Hostel Management Routes
router.get("/hostels", authenticate, getAllHostels);
router.post(
  "/hostels",
  authenticate,
  authorize("admin"),
  createHostel,
);
router.put(
  "/hostels/:id",
  authenticate,
  authorize("admin"),
  updateHostel,
);

// Room Management Routes
router.get("/hostels/:hostelId/rooms", authenticate, getHostelRooms);
router.post("/rooms", authenticate, authorize("admin"), createRoom);
router.put(
  "/rooms/:id",
  authenticate,
  authorize("admin"),
  updateRoom,
);

// Hostel Allocation Routes
router.post(
  "/allocate",
  authenticate,
  authorize("admin", "warden"),
  allocateHostel,
);
router.put(
  "/allocations/:allocationId/checkin",
  authenticate,
  authorize("admin", "warden"),
  checkIn,
);
router.put(
  "/allocations/:allocationId/checkout",
  authenticate,
  authorize("admin", "warden"),
  checkOut,
);
router.get(
  "/student/:studentId/allocations",
  authenticate,
  getStudentAllocations,
);

// Hostel Payment Routes
router.post("/payments", authenticate, makeHostelPayment);
router.get(
  "/student/:studentId/payments",
  authenticate,
  getHostelPayments,
);

export default router;