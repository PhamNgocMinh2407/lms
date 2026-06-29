import SubjectProposal from "../models/SubjectProposal.js";
import CourseSection from "../models/CourseSection.js";
import Enrollment from "../models/Enrollment.js";
import Grade from "../models/Grade.js";
import Subject from "../models/Subject.js";
import User from "../models/User.js";

export const getHtDashboard = async (req, res) => {
    try {
        const [
            pendingHtProposals,
            approvedForPdt,
            publishedProposals,
            rejectedByHt,
            totalCourseSections,
            totalEnrollments,
            totalGrades
        ] = await Promise.all([
            SubjectProposal.countDocuments({
                status: "pending_ht",
                isDeleted: false
            }),

            SubjectProposal.countDocuments({
                status: "approved_for_pdt",
                isDeleted: false
            }),

            SubjectProposal.countDocuments({
                status: "published",
                isDeleted: false
            }),

            SubjectProposal.countDocuments({
                status: "ht_rejected",
                isDeleted: false
            }),

            CourseSection.countDocuments({
                isDeleted: false
            }),

            Enrollment.countDocuments({
                isDeleted: false
            }),

            Grade.countDocuments({
                isDeleted: false
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Lấy dashboard hiệu trưởng thành công",
            data: {
                subjectProposals: {
                    pendingHtProposals,
                    approvedForPdt,
                    publishedProposals,
                    rejectedByHt
                },
                academicOverview: {
                    totalCourseSections,
                    totalEnrollments,
                    totalGrades
                }
            }
        });

    } catch (error) {
        console.error("getHtDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getHtPendingSubjectProposals = async (req, res) => {
    try {
        const proposals = await SubjectProposal.find({
            status: "pending_ht",
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .populate("tbmReviewedBy", "username displayName DisplayName email role")
            .sort({ tbmReviewedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất chờ hiệu trưởng duyệt thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getHtPendingSubjectProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getHtReviewedSubjectProposals = async (req, res) => {
    try {
        const htId = req.user.id || req.user._id;

        const proposals = await SubjectProposal.find({
            htReviewedBy: htId,
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .populate("tbmReviewedBy", "username displayName DisplayName email role")
            .populate("publishedBy", "username displayName DisplayName email role")
            .populate("publishedSubjectId", "code name credits")
            .sort({ htReviewedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất hiệu trưởng đã xử lý thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getHtReviewedSubjectProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getHtApprovedForPdtSubjectProposals = async (req, res) => {
    try {
        const htId = req.user.id || req.user._id;

        const proposals = await SubjectProposal.find({
            htReviewedBy: htId,
            status: {
                $in: ["approved_for_pdt", "published"]
            },
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .populate("tbmReviewedBy", "username displayName DisplayName email role")
            .populate("publishedBy", "username displayName DisplayName email role")
            .populate("publishedSubjectId", "code name credits")
            .sort({ htReviewedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất đã chuyển cho phòng đào tạo thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getHtApprovedForPdtSubjectProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getHtAcademicReport = async (req, res) => {
    try {
        const [
            totalSubjects,
            totalTeachers,
            totalStudents,
            totalCourseSections,
            totalEnrollments,
            enrolledCount,
            completedCount,
            cancelledCount,
            totalGrades,
            publishedGrades,
            passedGrades,
            failedGrades
        ] = await Promise.all([
            Subject.countDocuments({
                isDeleted: false
            }),

            User.countDocuments({
                role: "teacher",
                isDeleted: false
            }),

            User.countDocuments({
                role: "student",
                isDeleted: false
            }),

            CourseSection.countDocuments({
                isDeleted: false
            }),

            Enrollment.countDocuments({
                isDeleted: false
            }),

            Enrollment.countDocuments({
                status: "enrolled",
                isDeleted: false
            }),

            Enrollment.countDocuments({
                status: "completed",
                isDeleted: false
            }),

            Enrollment.countDocuments({
                status: "cancelled",
                isDeleted: false
            }),

            Grade.countDocuments({
                isDeleted: false
            }),

            Grade.countDocuments({
                isDeleted: false,
                isPublished: true
            }),

            Grade.countDocuments({
                isDeleted: false,
                isPublished: true,
                total: {
                    $gte: 4
                }
            }),

            Grade.countDocuments({
                isDeleted: false,
                isPublished: true,
                total: {
                    $lt: 4
                }
            })
        ]);

        const passRate = publishedGrades > 0
            ? Number(((passedGrades / publishedGrades) * 100).toFixed(2))
            : 0;

        const failRate = publishedGrades > 0
            ? Number(((failedGrades / publishedGrades) * 100).toFixed(2))
            : 0;

        return res.status(200).json({
            success: true,
            message: "Lấy báo cáo học vụ thành công",
            data: {
                overview: {
                    totalSubjects,
                    totalTeachers,
                    totalStudents,
                    totalCourseSections
                },
                enrollments: {
                    totalEnrollments,
                    enrolledCount,
                    completedCount,
                    cancelledCount
                },
                grades: {
                    totalGrades,
                    publishedGrades,
                    unpublishedGrades: totalGrades - publishedGrades,
                    passedGrades,
                    failedGrades,
                    passRate,
                    failRate
                }
            }
        });

    } catch (error) {
        console.error("getHtAcademicReport:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};