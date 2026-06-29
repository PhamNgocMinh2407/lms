import CourseSection from "../models/CourseSection.js";
import Enrollment from "../models/Enrollment.js";
import Grade from "../models/Grade.js";

export const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const enrollments = await Enrollment.find({
            studentId,
            isDeleted: false
        }).select("_id status courseSectionId");

        const enrollmentIds = enrollments.map((item) => item._id);

        const totalGrades = await Grade.countDocuments({
            enrollmentId: { $in: enrollmentIds },
            isDeleted: false,
            isPublished: true
        });

        return res.status(200).json({
            success: true,
            message: "Lấy dashboard sinh viên thành công",
            data: {
                totalEnrollments: enrollments.length,
                activeEnrollments: enrollments.filter(
                    (item) => item.status === "enrolled"
                ).length,
                completedEnrollments: enrollments.filter(
                    (item) => item.status === "completed"
                ).length,
                cancelledEnrollments: enrollments.filter(
                    (item) => item.status === "cancelled"
                ).length,
                publishedGrades: totalGrades
            }
        });

    } catch (error) {
        console.error("getStudentDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getStudentCourseSections = async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const enrollments = await Enrollment.find({
            studentId,
            isDeleted: false
        })
            .populate({
                path: "courseSectionId",
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
            message: "Lấy danh sách lớp học phần của sinh viên thành công",
            count: enrollments.length,
            data: enrollments
        });

    } catch (error) {
        console.error("getStudentCourseSections:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getStudentGrades = async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const enrollments = await Enrollment.find({
            studentId,
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

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách điểm của sinh viên thành công",
            count: grades.length,
            data: grades
        });

    } catch (error) {
        console.error("getStudentGrades:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getStudentTranscript = async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const enrollments = await Enrollment.find({
            studentId,
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
        console.error("getStudentTranscript:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getAvailableCourseSections = async (req, res) => {
    try {
        const studentId = req.user.id || req.user._id;

        const enrollments = await Enrollment.find({
            studentId,
            isDeleted: false,
            status: {
                $in: ["enrolled", "completed"]
            }
        }).select("courseSectionId");

        const registeredCourseSectionIds = enrollments.map(
            (item) => item.courseSectionId
        );

        const courseSections = await CourseSection.find({
            _id: {
                $nin: registeredCourseSectionIds
            },
            isDeleted: false
        })
            .populate("subjectId", "code name credits")
            .populate("teacherId", "username displayName DisplayName email")
            .populate("semesterId", "name")
            .populate("roomId", "code name building")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lớp học phần có thể đăng ký thành công",
            count: courseSections.length,
            data: courseSections
        });

    } catch (error) {
        console.error("getAvailableCourseSections:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};