"use strict";
/** @format */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = exports.Teacher = exports.Student = exports.User = void 0;
var mongoose_1 = require("mongoose");
var bcrypt = require("bcryptjs");
var userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "teacher", "student"],
        required: true,
    },
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        dateOfBirth: { type: Date, required: true },
        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
        },
        avatar: { type: String },
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
}, { timestamps: true, discriminatorKey: "role" });
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!this.isModified("password"))
                        return [2 /*return*/, next()];
                    _a = this;
                    return [4 /*yield*/, bcrypt.hash(this.password, 12)];
                case 1:
                    _a.password = _b.sent();
                    next();
                    return [2 /*return*/];
            }
        });
    });
});
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcrypt.compare(candidatePassword, this.password)];
        });
    });
};
var studentSchema = new mongoose_1.Schema({
    studentId: { type: String, required: true, unique: true },
    academicInfo: {
        admissionDate: { type: Date, required: true },
        currentSemester: { type: Number, required: true },
        department: { type: String, required: true },
        program: { type: String, required: true },
        batch: { type: String, required: true },
    },
    parentInfo: {
        fatherName: { type: String, required: true },
        motherName: { type: String, required: true },
        parentPhone: { type: String, required: true },
        parentEmail: { type: String, required: true },
    },
    fees: {
        totalAmount: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        dueAmount: { type: Number, default: 0 },
        paymentHistory: [
            {
                amount: Number,
                date: Date,
                method: String,
                transactionId: String,
                status: { type: String, enum: ["pending", "completed", "failed"] },
            },
        ],
    },
});
var teacherSchema = new mongoose_1.Schema({
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    qualifications: [{ type: String }],
    subjects: [{ type: String }],
    joiningDate: { type: Date, required: true },
    salary: { type: Number, required: true },
});
var adminSchema = new mongoose_1.Schema({
    adminId: { type: String, required: true, unique: true },
    permissions: [{ type: String }],
});
exports.User = mongoose_1.default.model("User", userSchema);
exports.Student = exports.User.discriminator("student", studentSchema);
exports.Teacher = exports.User.discriminator("teacher", teacherSchema);
exports.Admin = exports.User.discriminator("admin", adminSchema);
