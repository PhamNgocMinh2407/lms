import mongoose from "mongoose";

import Attendance from "../models/Attendance.js";
import CourseSection from "../models/CourseSection.js";
import Enrollment from "../models/Enrollment.js";

const validAttendanceStatuses = ["present", "absent", "late", "excused"];

const normalizeDate = (dateValue) => {
    const date = dateValue ? new Date(dateValue) : new Date();

    date.setHours(0, 0, 0, 0);

    return date;
};

export const takeAttendance = async (req, res) => {
    try {
        const { courseSectionId, attendanceDate, records } = req.body || {};
        const teacherId = req.user.id || req.user._id;

        if (!courseSectionId || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập lớp học phần và danh sách điểm danh"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(courseSectionId)) {
            return res.status(400).json({
                success: false,
                message: "ID lớp học phần không hợp lệ"
            });
        }

        const courseSection = await CourseSection.findOne({
            _id: courseSectionId,
            isDeleted: false
        });

        if (!courseSection) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lớp học phần"
            });
        }

        if (
            req.user.role === "teacher" &&
            courseSection.teacherId.toString() !== teacherId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền điểm danh lớp học phần này"
            });
        }

        const normalizedDate = normalizeDate(attendanceDate);
        const savedAttendances = [];

        for (const record of records) {
            const { studentId, status = "present", note = "" } = record;

            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID sinh viên không hợp lệ"
                });
            }

            if (!validAttendanceStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Trạng thái điểm danh không hợp lệ"
                });
            }

            const enrollment = await Enrollment.findOne({
                studentId,
                courseSectionId,
                isDeleted: false,
                status: "enrolled"
            });

            if (!enrollment) {
                return res.status(400).json({
                    success: false,
                    message: "Sinh viên không thuộc lớp học phần hoặc không còn đang học"
                });
            }

            const attendance = await Attendance.findOneAndUpdate(
                {
                    courseSectionId,
                    studentId,
                    attendanceDate: normalizedDate,
                    isDeleted: false
                },
                {
                    courseSectionId,
                    studentId,
                    enrollmentId: enrollment._id,
                    teacherId: courseSection.teacherId,
                    attendanceDate: normalizedDate,
                    status,
                    note
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );

            savedAttendances.push(attendance);
        }

        return res.status(201).json({
            success: true,
            message: "Điểm danh thành công",
            count: savedAttendances.length,
            data: savedAttendances
        });

    } catch (error) {
        console.error("takeAttendance:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getCourseSectionAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;
        const userId = req.user.id || req.user._id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID lớp học phần không hợp lệ"
            });
        }

        const courseSection = await CourseSection.findOne({
            _id: id,
            isDeleted: false
        });

        if (!courseSection) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lớp học phần"
            });
        }

        if (
            req.user.role === "teacher" &&
            courseSection.teacherId.toString() !== userId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xem điểm danh lớp này"
            });
        }

        const filter = {
            courseSectionId: id,
            isDeleted: false
        };

        if (date) {
            filter.attendanceDate = normalizeDate(date);
        }

        const attendances = await Attendance.find(filter)
            .populate("studentId", "username displayName DisplayName email phone")
            .populate("teacherId", "username displayName DisplayName email")
            .populate({
                path: "courseSectionId",
                select: "code name",
                populate: {
                    path: "subjectId",
                    select: "code name credits"
                }
            })
            .sort({ attendanceDate: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách điểm danh lớp học phần thành công",
            count: attendances.length,
            data: attendances
        });

    } catch (error) {
        console.error("getCourseSectionAttendance:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getMyAttendance = async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const attendances = await Attendance.find({
            studentId,
            isDeleted: false
        })
            .populate({
                path: "courseSectionId",
                select: "code name",
                populate: [
                    {
                        path: "subjectId",
                        select: "code name credits"
                    },
                    {
                        path: "teacherId",
                        select: "username displayName DisplayName email"
                    },
                    {
                        path: "semesterId",
                        select: "name"
                    }
                ]
            })
            .sort({ attendanceDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy lịch sử điểm danh của sinh viên thành công",
            count: attendances.length,
            data: attendances
        });

    } catch (error) {
        console.error("getMyAttendance:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};