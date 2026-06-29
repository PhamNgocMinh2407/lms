import SubjectProposal from "../models/SubjectProposal.js";
import Subject from "../models/Subject.js";
import CourseSection from "../models/CourseSection.js";
import Enrollment from "../models/Enrollment.js";
import Grade from "../models/Grade.js";
import mongoose from "mongoose";

export const getPdtDashboard = async (req, res) => {
    try {
        const [
            approvedForPdt,
            publishedProposals,
            totalSubjects,
            totalCourseSections,
            totalEnrollments,
            totalGrades
        ] = await Promise.all([
            SubjectProposal.countDocuments({
                status: "approved_for_pdt",
                isDeleted: false
            }),

            SubjectProposal.countDocuments({
                status: "published",
                isDeleted: false
            }),

            Subject.countDocuments({
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
            message: "Lấy dashboard phòng đào tạo thành công",
            data: {
                subjectProposals: {
                    approvedForPdt,
                    publishedProposals
                },
                academicOverview: {
                    totalSubjects,
                    totalCourseSections,
                    totalEnrollments,
                    totalGrades
                }
            }
        });

    } catch (error) {
        console.error("getPdtDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getPdtApprovedSubjectProposals = async (req, res) => {
    try {
        const proposals = await SubjectProposal.find({
            status: "approved_for_pdt",
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .populate("tbmReviewedBy", "username displayName DisplayName email role")
            .populate("htReviewedBy", "username displayName DisplayName email role")
            .sort({ htReviewedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất chờ phòng đào tạo công bố thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getPdtApprovedSubjectProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getPdtPublishedSubjectProposals = async (req, res) => {
    try {
        const proposals = await SubjectProposal.find({
            status: "published",
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .populate("tbmReviewedBy", "username displayName DisplayName email role")
            .populate("htReviewedBy", "username displayName DisplayName email role")
            .populate("publishedBy", "username displayName DisplayName email role")
            .populate("publishedSubjectId", "code name credits")
            .sort({ publishedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất đã công bố thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getPdtPublishedSubjectProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getPdtCourseSections = async (req, res) => {
    try {
        const courseSections = await CourseSection.find({
            isDeleted: false
        })
            .populate("subjectId", "code name credits")
            .populate("teacherId", "username displayName DisplayName email role")
            .populate("semesterId", "name")
            .populate("roomId", "code name building")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lớp học phần thành công",
            count: courseSections.length,
            data: courseSections
        });

    } catch (error) {
        console.error("getPdtCourseSections:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getPdtEnrollments = async (req, res) => {
    try {
        const { status, courseSectionId, studentId } = req.query;

        const filter = {
            isDeleted: false
        };

        if (status) {
            filter.status = status;
        }

        if (courseSectionId) {
            filter.courseSectionId = courseSectionId;
        }

        if (studentId) {
            filter.studentId = studentId;
        }

        const enrollments = await Enrollment.find(filter)
            .populate("studentId", "username displayName DisplayName email phone role")
            .populate({
                path: "courseSectionId",
                select: "code name maxStudents status",
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
                    },
                    {
                        path: "roomId",
                        select: "code name building"
                    }
                ]
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đăng ký học phần thành công",
            count: enrollments.length,
            data: enrollments
        });

    } catch (error) {
        console.error("getPdtEnrollments:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getPdtGrades = async (req, res) => {
    try {
        const { isPublished, isLocked } = req.query;

        const filter = {
            isDeleted: false
        };

        if (isPublished !== undefined) {
            filter.isPublished = isPublished === "true";
        }

        if (isLocked !== undefined) {
            filter.isLocked = isLocked === "true";
        }

        const grades = await Grade.find(filter)
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
                                path: "teacherId",
                                select: "username displayName DisplayName email"
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
            message: "Lấy danh sách điểm thành công",
            count: grades.length,
            data: grades
        });

    } catch (error) {
        console.error("getPdtGrades:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getPdtStudentTranscript = async (req, res) => {
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

        const grades = await Grade.find({
            enrollmentId: { $in: enrollmentIds },
            isDeleted: false,
            isPublished: true
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
                                path: "teacherId",
                                select: "username displayName DisplayName email"
                            },
                            {
                                path: "semesterId",
                                select: "name"
                            }
                        ]
                    }
                ]
            })
            .sort({ createdAt: -1 });

        const transcript = grades.map((grade) => {
            const enrollment = grade.enrollmentId;
            const courseSection = enrollment?.courseSectionId;
            const subject = courseSection?.subjectId;

            return {
                gradeId: grade._id,
                student: enrollment?.studentId || null,
                subject: {
                    id: subject?._id,
                    code: subject?.code,
                    name: subject?.name,
                    credits: subject?.credits
                },
                courseSection: {
                    id: courseSection?._id,
                    code: courseSection?.code,
                    name: courseSection?.name
                },
                semester: courseSection?.semesterId || null,
                teacher: courseSection?.teacherId || null,
                scores: {
                    attendance: grade.attendance,
                    assignment: grade.assignment,
                    midterm: grade.midterm,
                    finalExam: grade.finalExam,
                    total: grade.total,
                    letterGrade: grade.letterGrade
                },
                result: {
                    status: grade.total >= 4 ? "passed" : "failed"
                }
            };
        });

        return res.status(200).json({
            success: true,
            message: "Lấy bảng điểm sinh viên thành công",
            count: transcript.length,
            data: transcript
        });

    } catch (error) {
        console.error("getPdtStudentTranscript:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};