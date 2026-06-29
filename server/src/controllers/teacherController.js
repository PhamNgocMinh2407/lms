import CourseSection from "../models/CourseSection.js";
import Enrollment from "../models/Enrollment.js";
import Grade from "../models/Grade.js";
import SubjectProposal from "../models/SubjectProposal.js";

export const getMyCourseSections = async (req, res) => {
    try {
        const teacherId = req.user.id || req.user._id;

        const courseSections = await CourseSection.find({
            teacherId,
            isDeleted: false
        })
            .populate("subjectId", "code name credits")
            .populate("semesterId", "name")
            .populate("roomId", "code name building")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lớp học phần của giảng viên thành công",
            count: courseSections.length,
            data: courseSections
        });

    } catch (error) {
        console.error("getMyCourseSections:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getMyStudents = async (req, res) => {
    try {
        const teacherId = req.user.id || req.user._id;

        const courseSections = await CourseSection.find({
            teacherId,
            isDeleted: false
        }).select("_id");

        const courseSectionIds = courseSections.map((item) => item._id);

        const enrollments = await Enrollment.find({
            courseSectionId: { $in: courseSectionIds },
            isDeleted: false,
            status: "enrolled"
        })
            .populate("studentId", "username displayName DisplayName email phone role")
            .populate({
                path: "courseSectionId",
                select: "code name",
                populate: {
                    path: "subjectId",
                    select: "code name credits"
                }
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sinh viên của giảng viên thành công",
            count: enrollments.length,
            data: enrollments
        });

    } catch (error) {
        console.error("getMyStudents:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getTeacherDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id || req.user._id;

        const courseSections = await CourseSection.find({
            teacherId,
            isDeleted: false
        }).select("_id");

        const courseSectionIds = courseSections.map((item) => item._id);

        const enrollments = await Enrollment.find({
            courseSectionId: { $in: courseSectionIds },
            isDeleted: false
        }).select("_id status");

        const enrollmentIds = enrollments.map((item) => item._id);

        const totalGrades = await Grade.countDocuments({
            enrollmentId: { $in: enrollmentIds },
            isDeleted: false
        });

        const publishedGrades = await Grade.countDocuments({
            enrollmentId: { $in: enrollmentIds },
            isDeleted: false,
            isPublished: true
        });

        return res.status(200).json({
            success: true,
            message: "Lấy dashboard giảng viên thành công",
            data: {
                totalCourseSections: courseSections.length,
                totalEnrollments: enrollments.length,
                totalActiveStudents: enrollments.filter(
                    (item) => item.status === "enrolled"
                ).length,
                totalCompletedEnrollments: enrollments.filter(
                    (item) => item.status === "completed"
                ).length,
                totalGrades,
                publishedGrades,
                unpublishedGrades: totalGrades - publishedGrades
            }
        });

    } catch (error) {
        console.error("getTeacherDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getMyGrades = async (req, res) => {
    try {
        const teacherId = req.user.id || req.user._id;

        const courseSections = await CourseSection.find({
            teacherId,
            isDeleted: false
        }).select("_id");

        const courseSectionIds = courseSections.map((item) => item._id);

        const enrollments = await Enrollment.find({
            courseSectionId: { $in: courseSectionIds },
            isDeleted: false
        }).select("_id");

        const enrollmentIds = enrollments.map((item) => item._id);

        const grades = await Grade.find({
            enrollmentId: { $in: enrollmentIds },
            isDeleted: false
        })
            .populate({
                path: "enrollmentId",
                populate: [
                    {
                        path: "studentId",
                        select: "username displayName DisplayName email phone"
                    },
                    {
                        path: "courseSectionId",
                        select: "code name",
                        populate: [
                            {
                                path: "subjectId",
                                select: "code name credits"
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
                    }
                ]
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách điểm của giảng viên thành công",
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

export const getMySubjectProposals = async (req, res) => {
    try {
        const teacherId = req.user.id || req.user._id;

        const proposals = await SubjectProposal.find({
            createdBy: teacherId,
            isDeleted: false
        })
            .populate("tbmReviewedBy", "username displayName DisplayName email role")
            .populate("htReviewedBy", "username displayName DisplayName email role")
            .populate("publishedBy", "username displayName DisplayName email role")
            .populate("publishedSubjectId", "code name credits")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất môn học của giảng viên thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getMySubjectProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};