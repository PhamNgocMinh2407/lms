import Grade from "../models/Grade.js";
import Enrollment from "../models/Enrollment.js";
import mongoose from "mongoose";

import {
    getGradePoint,
    isPassedGrade,
    calculateGPA
} from "../utils/gpaCalculator.js";

export const getMyTranscript = async (req, res) => {
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
                        path: "studentId",
                        select: "username displayName DisplayName email"
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
                                select: "displayName DisplayName email"
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

        const transcriptItems = grades.map((grade) => {
            const enrollment = grade.enrollmentId;
            const courseSection = enrollment?.courseSectionId;
            const subject = courseSection?.subjectId;

            const credits = Number(subject?.credits || 0);
            const gradePoint = getGradePoint(grade.total);
            const isPassed = isPassedGrade(grade.total);

            return {
                gradeId: grade._id,
                enrollmentId: enrollment?._id,
                courseSection: {
                    id: courseSection?._id,
                    code: courseSection?.code,
                    name: courseSection?.name
                },
                subject: {
                    id: subject?._id,
                    code: subject?.code,
                    name: subject?.name,
                    credits
                },
                semester: courseSection?.semesterId || null,
                teacher: courseSection?.teacherId || null,
                scores: {
                    attendance: grade.attendance,
                    assignment: grade.assignment,
                    midterm: grade.midterm,
                    finalExam: grade.finalExam,
                    total: grade.total,
                    letterGrade: grade.letterGrade,
                    gradePoint
                },
                result: {
                    isPassed,
                    status: isPassed ? "passed" : "failed"
                }
            };
        });

        const summary = calculateGPA(
            transcriptItems.map((item) => ({
                credits: item.subject.credits,
                gradePoint: item.scores.gradePoint,
                isPassed: item.result.isPassed
            }))
        );

        return res.status(200).json({
            success: true,
            message: "Lấy bảng điểm sinh viên thành công",
            data: {
                summary,
                transcript: transcriptItems
            }
        });

    } catch (error) {
        console.error("getMyTranscript:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const getStudentTranscript = async (req, res) => {
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
                                select: "displayName DisplayName email"
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

        const transcriptItems = grades.map((grade) => {
            const enrollment = grade.enrollmentId;
            const courseSection = enrollment?.courseSectionId;
            const subject = courseSection?.subjectId;

            const credits = Number(subject?.credits || 0);
            const gradePoint = getGradePoint(grade.total);
            const isPassed = isPassedGrade(grade.total);

            return {
                gradeId: grade._id,
                enrollmentId: enrollment?._id,
                courseSection: {
                    id: courseSection?._id,
                    code: courseSection?.code,
                    name: courseSection?.name
                },
                subject: {
                    id: subject?._id,
                    code: subject?.code,
                    name: subject?.name,
                    credits
                },
                semester: courseSection?.semesterId || null,
                teacher: courseSection?.teacherId || null,
                scores: {
                    attendance: grade.attendance,
                    assignment: grade.assignment,
                    midterm: grade.midterm,
                    finalExam: grade.finalExam,
                    total: grade.total,
                    letterGrade: grade.letterGrade,
                    gradePoint
                },
                result: {
                    isPassed,
                    status: isPassed ? "passed" : "failed"
                }
            };
        });

        const summary = calculateGPA(
            transcriptItems.map((item) => ({
                credits: item.subject.credits,
                gradePoint: item.scores.gradePoint,
                isPassed: item.result.isPassed
            }))
        );

        const student = grades[0]?.enrollmentId?.studentId || null;

        return res.status(200).json({
            success: true,
            message: "Lấy bảng điểm sinh viên thành công",
            data: {
                student,
                summary,
                transcript: transcriptItems
            }
        });

    } catch (error) {
        console.error("getStudentTranscript:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};