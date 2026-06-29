import mongoose from "mongoose";

import Grade from "../models/Grade.js";
import Enrollment from "../models/Enrollment.js";
import CourseSection from "../models/CourseSection.js";
import {
    calculateTotalGrade,
    calculateLetterGrade,
    isValidGradeValue
} from "../utils/gradeCalculator.js";

const populateGradeQuery = (query) => {
    return query.populate({
        path: "enrollmentId",
        populate: [
            {
                path: "studentId",
                select: "username displayName email role"
            },
            {
                path: "courseSectionId",
                select: "code name",
                populate: [
                    { path: "subjectId", select: "code name credits" },
                    { path: "teacherId", select: "displayName email" },
                    { path: "semesterId", select: "name" },
                    { path: "roomId", select: "code name" }
                ]
            }
        ]
    });
};

export const createGrade = async (req, res) => {
    try {
        const {
            enrollmentId,
            attendance = 0,
            assignment = 0,
            midterm = 0,
            finalExam = 0,
            note
        } = req.body || {};

        if (!enrollmentId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập mã đăng ký học phần"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
            return res.status(400).json({
                success: false,
                message: "ID đăng ký học phần không hợp lệ"
            });
        }

        const gradeValues = {
            attendance,
            assignment,
            midterm,
            finalExam
        };

        for (const [key, value] of Object.entries(gradeValues)) {
            if (!isValidGradeValue(value)) {
                return res.status(400).json({
                    success: false,
                    message: `${key} phải là số từ 0 đến 10`
                });
            }
        }

        const enrollment = await Enrollment.findOne({
            _id: enrollmentId,
            isDeleted: false
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đăng ký học phần"
            });
        }

        if (enrollment.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Không thể nhập điểm cho học phần đã hủy"
            });
        }

        const existedGrade = await Grade.findOne({
            enrollmentId,
            isDeleted: false
        });

        if (existedGrade) {
            return res.status(409).json({
                success: false,
                message: "Điểm của đăng ký học phần này đã tồn tại"
            });
        }

        const numericGrades = {
            attendance: Number(attendance),
            assignment: Number(assignment),
            midterm: Number(midterm),
            finalExam: Number(finalExam)
        };

        const total = calculateTotalGrade(numericGrades);
        const letterGrade = calculateLetterGrade(total);

        const grade = await Grade.create({
            enrollmentId,
            ...numericGrades,
            total,
            letterGrade,
            note
        });

        const populatedGrade = await populateGradeQuery(
            Grade.findById(grade._id)
        );

        return res.status(201).json({
            success: true,
            message: "Nhập điểm thành công",
            data: populatedGrade
        });

    } catch (error) {
        console.error("createGrade:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getAllGrades = async (req, res) => {
    try {
        const { enrollmentId, isPublished, isLocked } = req.query;

        const filter = {
            isDeleted: false
        };

        if (enrollmentId) {
            if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID đăng ký học phần không hợp lệ"
                });
            }

            filter.enrollmentId = enrollmentId;
        }

        if (isPublished !== undefined) {
            filter.isPublished = isPublished === "true";
        }

        if (isLocked !== undefined) {
            filter.isLocked = isLocked === "true";
        }

        const grades = await populateGradeQuery(
            Grade.find(filter).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách điểm thành công",
            count: grades.length,
            data: grades
        });

    } catch (error) {
        console.error("getAllGrades:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getGradeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID điểm không hợp lệ"
            });
        }

        const grade = await populateGradeQuery(
            Grade.findOne({
                _id: id,
                isDeleted: false
            })
        );

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin điểm thành công",
            data: grade
        });

    } catch (error) {
        console.error("getGradeById:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const updateGrade = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            attendance,
            assignment,
            midterm,
            finalExam,
            note
        } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID điểm không hợp lệ"
            });
        }

        const grade = await Grade.findOne({
            _id: id,
            isDeleted: false
        });

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        if (grade.isLocked) {
            return res.status(400).json({
                success: false,
                message: "Điểm đã bị khóa, không thể chỉnh sửa"
            });
        }

        const updates = {
            attendance,
            assignment,
            midterm,
            finalExam
        };

        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                if (!isValidGradeValue(value)) {
                    return res.status(400).json({
                        success: false,
                        message: `${key} phải là số từ 0 đến 10`
                    });
                }

                grade[key] = Number(value);
            }
        }

        if (note !== undefined) {
            grade.note = note;
        }

        const total = calculateTotalGrade({
            attendance: grade.attendance,
            assignment: grade.assignment,
            midterm: grade.midterm,
            finalExam: grade.finalExam
        });

        grade.total = total;
        grade.letterGrade = calculateLetterGrade(total);

        await grade.save();

        const updatedGrade = await populateGradeQuery(
            Grade.findById(grade._id)
        );

        return res.status(200).json({
            success: true,
            message: "Cập nhật điểm thành công",
            data: updatedGrade
        });

    } catch (error) {
        console.error("updateGrade:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const deleteGrade = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID điểm không hợp lệ"
            });
        }

        const grade = await Grade.findOne({
            _id: id,
            isDeleted: false
        });

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        if (grade.isLocked) {
            return res.status(400).json({
                success: false,
                message: "Điểm đã bị khóa, không thể xóa"
            });
        }

        grade.isDeleted = true;
        await grade.save();

        return res.status(200).json({
            success: true,
            message: "Xóa điểm thành công"
        });

    } catch (error) {
        console.error("deleteGrade:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const publishGrade = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID điểm không hợp lệ"
            });
        }

        const grade = await Grade.findOne({
            _id: id,
            isDeleted: false
        });

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        grade.isPublished = true;
        await grade.save();

        return res.status(200).json({
            success: true,
            message: "Công bố điểm thành công"
        });

    } catch (error) {
        console.error("publishGrade:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const lockGrade = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID điểm không hợp lệ"
            });
        }

        const grade = await Grade.findOne({
            _id: id,
            isDeleted: false
        });

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        grade.isLocked = true;
        await grade.save();

        return res.status(200).json({
            success: true,
            message: "Khóa điểm thành công"
        });

    } catch (error) {
        console.error("lockGrade:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const unlockGrade = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID điểm không hợp lệ"
            });
        }

        const grade = await Grade.findOne({
            _id: id,
            isDeleted: false
        });

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy điểm"
            });
        }

        if (!grade.isLocked) {
            return res.status(400).json({
                success: false,
                message: "Điểm chưa bị khóa"
            });
        }

        grade.isLocked = false;

        await grade.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa điểm thành công",
            data: grade
        });

    } catch (error) {
        console.error("unlockGrade:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const getMyGrades = async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const enrollments = await Enrollment.find({
            studentId,
            isDeleted: false
        }).select("_id");

        const enrollmentIds = enrollments.map((item) => item._id);

        const grades = await populateGradeQuery(
            Grade.find({
                enrollmentId: { $in: enrollmentIds },
                isDeleted: false,
                isPublished: true
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách điểm của sinh viên thành công",
            count: grades.length,
            data: grades
        });

    } catch (error) {
        console.error("getMyGrades:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getGradesByStudentId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID sinh viên không hợp lệ"
            });
        }

        const enrollments = await Enrollment.find({
            studentId: id,
            isDeleted: false
        }).select("_id");

        const enrollmentIds = enrollments.map((item) => item._id);

        const grades = await populateGradeQuery(
            Grade.find({
                enrollmentId: { $in: enrollmentIds },
                isDeleted: false
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy điểm theo sinh viên thành công",
            count: grades.length,
            data: grades
        });

    } catch (error) {
        console.error("getGradesByStudentId:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getGradesByCourseSectionId = async (req, res) => {
    try {
        const { id } = req.params;
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
                message: "Bạn không có quyền xem điểm của lớp học phần này"
            });
        }

        const enrollments = await Enrollment.find({
            courseSectionId: id,
            isDeleted: false
        }).select("_id");

        const enrollmentIds = enrollments.map((item) => item._id);

        const grades = await populateGradeQuery(
            Grade.find({
                enrollmentId: { $in: enrollmentIds },
                isDeleted: false
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy điểm theo lớp học phần thành công",
            count: grades.length,
            data: grades
        });

    } catch (error) {
        console.error("getGradesByCourseSectionId:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};