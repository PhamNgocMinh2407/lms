import User from "../models/User.js";
import Subject from "../models/Subject.js";
import CourseSection from "../models/CourseSection.js";
import Enrollment from "../models/Enrollment.js";
import Grade from "../models/Grade.js";
import SubjectProposal from "../models/SubjectProposal.js";
import Attendance from "../models/Attendance.js";

export const getAdminDashboard = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            lockedUsers,
            adminCount,
            hrCount,
            htCount,
            pdtCount,
            tbmCount,
            teacherCount,
            studentCount,
            totalSubjects,
            totalCourseSections,
            totalEnrollments,
            totalGrades,
            totalSubjectProposals,
            totalAttendances
        ] = await Promise.all([
            User.countDocuments({ isDeleted: false }),
            User.countDocuments({ isDeleted: false, isActive: true }),
            User.countDocuments({ isDeleted: false, isActive: false }),

            User.countDocuments({ role: "admin", isDeleted: false }),
            User.countDocuments({ role: "hr", isDeleted: false }),
            User.countDocuments({ role: "ht", isDeleted: false }),
            User.countDocuments({ role: "pdt", isDeleted: false }),
            User.countDocuments({ role: "tbm", isDeleted: false }),
            User.countDocuments({ role: "teacher", isDeleted: false }),
            User.countDocuments({ role: "student", isDeleted: false }),

            Subject.countDocuments({ isDeleted: false }),
            CourseSection.countDocuments({ isDeleted: false }),
            Enrollment.countDocuments({ isDeleted: false }),
            Grade.countDocuments({ isDeleted: false }),
            SubjectProposal.countDocuments({ isDeleted: false }),
            Attendance.countDocuments({ isDeleted: false })
        ]);

        return res.status(200).json({
            success: true,
            message: "Lấy dashboard admin thành công",
            data: {
                users: {
                    totalUsers,
                    activeUsers,
                    lockedUsers,
                    roles: {
                        admin: adminCount,
                        hr: hrCount,
                        ht: htCount,
                        pdt: pdtCount,
                        tbm: tbmCount,
                        teacher: teacherCount,
                        student: studentCount
                    }
                },
                academic: {
                    totalSubjects,
                    totalCourseSections,
                    totalEnrollments,
                    totalGrades,
                    totalSubjectProposals,
                    totalAttendances
                }
            }
        });

    } catch (error) {
        console.error("getAdminDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getSystemOverview = async (req, res) => {
    try {
        const [
            publishedGrades,
            unpublishedGrades,
            pendingTbmProposals,
            pendingHtProposals,
            approvedForPdtProposals,
            publishedProposals,
            enrolledCount,
            completedCount,
            cancelledCount,
            presentAttendances,
            absentAttendances,
            lateAttendances,
            excusedAttendances
        ] = await Promise.all([
            Grade.countDocuments({
                isDeleted: false,
                isPublished: true
            }),

            Grade.countDocuments({
                isDeleted: false,
                isPublished: false
            }),

            SubjectProposal.countDocuments({
                isDeleted: false,
                status: "pending_tbm"
            }),

            SubjectProposal.countDocuments({
                isDeleted: false,
                status: "pending_ht"
            }),

            SubjectProposal.countDocuments({
                isDeleted: false,
                status: "approved_for_pdt"
            }),

            SubjectProposal.countDocuments({
                isDeleted: false,
                status: "published"
            }),

            Enrollment.countDocuments({
                isDeleted: false,
                status: "enrolled"
            }),

            Enrollment.countDocuments({
                isDeleted: false,
                status: "completed"
            }),

            Enrollment.countDocuments({
                isDeleted: false,
                status: "cancelled"
            }),

            Attendance.countDocuments({
                isDeleted: false,
                status: "present"
            }),

            Attendance.countDocuments({
                isDeleted: false,
                status: "absent"
            }),

            Attendance.countDocuments({
                isDeleted: false,
                status: "late"
            }),

            Attendance.countDocuments({
                isDeleted: false,
                status: "excused"
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Lấy tổng quan hệ thống thành công",
            data: {
                grades: {
                    publishedGrades,
                    unpublishedGrades
                },
                subjectProposals: {
                    pendingTbmProposals,
                    pendingHtProposals,
                    approvedForPdtProposals,
                    publishedProposals
                },
                enrollments: {
                    enrolledCount,
                    completedCount,
                    cancelledCount
                },
                attendances: {
                    presentAttendances,
                    absentAttendances,
                    lateAttendances,
                    excusedAttendances
                }
            }
        });

    } catch (error) {
        console.error("getSystemOverview:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};