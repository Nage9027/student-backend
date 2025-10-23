"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
var mongoose_1 = require("mongoose");
var subjectSchema = new mongoose_1.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    teacher: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    coPoMapping: [
        {
            co: { type: String, required: true },
            po: [{ type: String, required: true }],
        },
    ],
}, { timestamps: true });
exports.Subject = (0, mongoose_1.model)("Subject", subjectSchema);
