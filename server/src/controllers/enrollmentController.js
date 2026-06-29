import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import CourseSection from "../models/CourseSection.js";

export const createEnrollment = async (req, res) => {
    try {
        const { studentId, courseSectionId, note } = req.body || {};

        if (!studentId || !courseSectionId) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập sinh viên và lớp học phần"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                success: false,
                message: "ID sinh viên không hợp lệ"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(courseSectionId)) {
            return res.status(400).json({
                success: false,
                message: "ID lớp học phần không hợp lệ"
            });
        }

        const student = await User.findOne({
            _id: studentId,
            role: "student",
            isDeleted: false,
            isActive: true
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên hợp lệ"
            });
        }

        const courseSection = await CourseSection.findOne({
            _id: courseSectionId,
            isDeleted: false,
            isActive: true
        });

        if (!courseSection) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lớp học phần hợp lệ"
            });
        }

        const existedEnrollment = await Enrollment.findOne({
            studentId,
            courseSectionId,
            isDeleted: false,
            status: { $in: ["enrolled", "completed"] }
        });

        if (existedEnrollment) {
            return res.status(409).json({
                success: false,
                message: "Sinh viên đã đăng ký lớp học phần này"
            });
        }

        const currentCount = await Enrollment.countDocuments({
            courseSectionId,
            isDeleted: false,
            status: "enrolled"
        });

        if (currentCount >= courseSection.maxStudents) {
            return res.status(400).json({
                success: false,
                message: "Lớp học phần đã đủ số lượng sinh viên"
            });
        }

        const enrollment = await Enrollment.create({
            studentId,
            courseSectionId,
            note
        });

        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate("studentId", "username displayName email role")
            .populate({
                path: "courseSectionId",
                select: "code name maxStudents",
                populate: [
                    { path: "subjectId", select: "code name credits" },
                    { path: "teacherId", select: "displayName email" },
                    { path: "semesterId", select: "name" },
                    { path: "roomId", select: "code name" }
                ]
            });

        return res.status(201).json({
            success: true,
            message: "Đăng ký học phần thành công",
            data: populatedEnrollment
        });

    } catch (error) {
        console.error("createEnrollment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const getAllEnrollments = async (req, res) => {
    try {

        const { studentId, courseSectionId, status } = req.query;

        const filter = {
            isDeleted: false
        };

        if (studentId) {
            if (!mongoose.Types.ObjectId.isValid(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID sinh viên không hợp lệ"
                });
            }

            filter.studentId = studentId;
        }

        if (courseSectionId) {
            if (!mongoose.Types.ObjectId.isValid(courseSectionId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID lớp học phần không hợp lệ"
                });
            }

            filter.courseSectionId = courseSectionId;
        }

        if (status) {
            filter.status = status;
        }

        const enrollments = await Enrollment.find(filter)
            .populate(
                "studentId",
                "username displayName email role"
            )
            .populate({
                path: "courseSectionId",
                select: "code name maxStudents",
                populate: [
                    {
                        path: "subjectId",
                        select: "code name credits"
                    },
                    {
                        path: "teacherId",
                        select: "displayName email"
                    },
                    {
                        path: "semesterId",
                        select: "name"
                    },
                    {
                        path: "roomId",
                        select: "code name"
                    }
                ]
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đăng ký học phần thành công",
            count: enrollments.length,
            data: enrollments
        });

    } catch (error) {

        console.error("getAllEnrollments:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }
};
export const getEnrollmentById = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đăng ký không hợp lệ"
            });
        }

        const enrollment = await Enrollment.findOne({
            _id: id,
            isDeleted: false
        })
            .populate(
                "studentId",
                "username displayName email role"
            )
            .populate({
                path: "courseSectionId",
                select: "code name maxStudents",
                populate: [
                    {
                        path: "subjectId",
                        select: "code name credits"
                    },
                    {
                        path: "teacherId",
                        select: "displayName email"
                    },
                    {
                        path: "semesterId",
                        select: "name"
                    },
                    {
                        path: "roomId",
                        select: "code name"
                    }
                ]
            });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đăng ký học phần"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin đăng ký học phần thành công",
            data: enrollment
        });

    } catch (error) {

        console.error("getEnrollmentById:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }

};

export const getMyEnrollments = async (req, res) => {

    try {

        const studentId = req.user.id;

        const enrollments = await Enrollment.find({
            studentId,
            isDeleted: false
        })
            .populate({
                path: "courseSectionId",
                select: "code name maxStudents",
                populate: [
                    {
                        path: "subjectId",
                        select: "code name credits"
                    },
                    {
                        path: "teacherId",
                        select: "displayName email"
                    },
                    {
                        path: "semesterId",
                        select: "name"
                    },
                    {
                        path: "roomId",
                        select: "code name building"
                    }
                ]
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách học phần của sinh viên thành công",
            count: enrollments.length,
            data: enrollments
        });

    } catch (error) {

        console.error("getMyEnrollments:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }

};

export const cancelEnrollment = async (req, res) => {

    try {

        const { id } = req.params;

        const studentId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đăng ký không hợp lệ"
            });
        }

        const enrollment = await Enrollment.findOne({
            _id: id,
            isDeleted: false
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đăng ký học phần"
            });
        }

        // Chỉ được hủy của chính mình
        if (enrollment.studentId.toString() !== studentId) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền hủy đăng ký này"
            });
        }

        if (enrollment.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Học phần đã được hủy trước đó"
            });
        }

        if (enrollment.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Không thể hủy học phần đã hoàn thành"
            });
        }

        enrollment.status = "cancelled";

        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: "Hủy đăng ký học phần thành công"
        });

    } catch (error) {

        console.error("cancelEnrollment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }

};

export const getCourseSectionStudents = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID lớp học phần không hợp lệ"
            });
        }

        const courseSection = await CourseSection.findOne({
            _id: id,
            isDeleted: false
        })
            .populate("subjectId", "code name credits")
            .populate("teacherId", "displayName email")
            .populate("semesterId", "name")
            .populate("roomId", "code name");

        if (!courseSection) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lớp học phần"
            });
        }

        if (
            req.user.role === "teacher" &&
            courseSection.teacherId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền xem lớp học phần này"
            });
        }

        const enrollments = await Enrollment.find({
            courseSectionId: id,
            isDeleted: false,
            status: "enrolled"
        })
            .populate("studentId", "username displayName email phone role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sinh viên lớp học phần thành công",
            data: {
                courseSection,
                totalStudents: enrollments.length,
                students: enrollments.map((item) => item.studentId)
            }
        });

    } catch (error) {
        console.error("getCourseSectionStudents:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const completeEnrollment = async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đăng ký không hợp lệ"
            });
        }

        const enrollment = await Enrollment.findOne({
            _id: id,
            isDeleted: false
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đăng ký học phần"
            });
        }

        if (enrollment.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Học phần đã hoàn thành trước đó"
            });
        }

        if (enrollment.status === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Không thể hoàn thành học phần đã hủy"
            });
        }

        enrollment.status = "completed";

        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: "Đánh dấu hoàn thành học phần thành công",
            data: enrollment
        });

    } catch (error) {

        console.error("completeEnrollment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }

};