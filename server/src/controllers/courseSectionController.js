import mongoose from "mongoose";

import CourseSection from "../models/CourseSection.js";
import Subject from "../models/Subject.js";
import Semester from "../models/Semester.js";
import Room from "../models/Room.js";
import User from "../models/User.js";

export const getAllCourseSections = async (req, res) => {
    try {
        const { keyword, subjectId, teacherId, semesterId, roomId } = req.query;

        const filter = { isDeleted: false };

        if (keyword) {
            filter.$or = [
                { code: { $regex: keyword, $options: "i" } },
                { name: { $regex: keyword, $options: "i" } }
            ];
        }

        if (subjectId) filter.subjectId = subjectId;
        if (teacherId) filter.teacherId = teacherId;
        if (semesterId) filter.semesterId = semesterId;
        if (roomId) filter.roomId = roomId;

        const courseSections = await CourseSection.find(filter)
            .populate("subjectId", "code name credits")
            .populate("teacherId", "username displayName email role")
            .populate("semesterId", "name startDate endDate")
            .populate("roomId", "code name building capacity")
            .select("-__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lớp học phần thành công",
            count: courseSections.length,
            data: courseSections
        });
    } catch (error) {
        console.error("getAllCourseSections:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getCourseSectionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp học phần không hợp lệ" });
        }

        const courseSection = await CourseSection.findOne({ _id: id, isDeleted: false })
            .populate("subjectId", "code name credits")
            .populate("teacherId", "username displayName email role")
            .populate("semesterId", "name startDate endDate")
            .populate("roomId", "code name building capacity")
            .select("-__v");

        if (!courseSection) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp học phần" });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin lớp học phần thành công",
            data: courseSection
        });
    } catch (error) {
        console.error("getCourseSectionById:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const createCourseSection = async (req, res) => {
    try {
        const {
            subjectId,
            teacherId,
            semesterId,
            roomId,
            code,
            name,
            maxStudents,
            description
        } = req.body || {};

        if (!subjectId || !teacherId || !semesterId || !roomId || !code || !name) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ môn học, giảng viên, học kỳ, phòng học, mã lớp và tên lớp"
            });
        }

        const ids = { subjectId, teacherId, semesterId, roomId };

        for (const [key, value] of Object.entries(ids)) {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).json({
                    success: false,
                    message: `${key} không hợp lệ`
                });
            }
        }

        const subject = await Subject.findOne({ _id: subjectId, isDeleted: false, isActive: true });
        if (!subject) {
            return res.status(404).json({ success: false, message: "Không tìm thấy môn học" });
        }

        const teacher = await User.findOne({
            _id: teacherId,
            role: "teacher",
            isDeleted: false,
            isActive: true
        });

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Không tìm thấy giảng viên hợp lệ" });
        }

        const semester = await Semester.findOne({ _id: semesterId, isDeleted: false, isActive: true });
        if (!semester) {
            return res.status(404).json({ success: false, message: "Không tìm thấy học kỳ" });
        }

        const room = await Room.findOne({ _id: roomId, isDeleted: false, isActive: true });
        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng học" });
        }

        const maxStudentNumber = maxStudents === undefined ? 40 : Number(maxStudents);

        if (!Number.isInteger(maxStudentNumber) || maxStudentNumber < 1) {
            return res.status(400).json({
                success: false,
                message: "Số lượng sinh viên tối đa phải là số nguyên lớn hơn hoặc bằng 1"
            });
        }

        const codeExists = await CourseSection.findOne({
            code: code.trim().toUpperCase(),
            isDeleted: false
        });

        if (codeExists) {
            return res.status(409).json({
                success: false,
                message: "Mã lớp học phần đã tồn tại"
            });
        }

        const courseSection = await CourseSection.create({
            subjectId,
            teacherId,
            semesterId,
            roomId,
            code,
            name,
            maxStudents: maxStudentNumber,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo lớp học phần thành công",
            data: courseSection
        });
    } catch (error) {
        console.error("createCourseSection:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const updateCourseSection = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            subjectId,
            teacherId,
            semesterId,
            roomId,
            code,
            name,
            maxStudents,
            description
        } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp học phần không hợp lệ" });
        }

        const courseSection = await CourseSection.findOne({ _id: id, isDeleted: false });

        if (!courseSection) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp học phần" });
        }

        if (subjectId) {
            if (!mongoose.Types.ObjectId.isValid(subjectId)) {
                return res.status(400).json({ success: false, message: "ID môn học không hợp lệ" });
            }

            const subject = await Subject.findOne({ _id: subjectId, isDeleted: false, isActive: true });
            if (!subject) {
                return res.status(404).json({ success: false, message: "Không tìm thấy môn học" });
            }

            courseSection.subjectId = subjectId;
        }

        if (teacherId) {
            if (!mongoose.Types.ObjectId.isValid(teacherId)) {
                return res.status(400).json({ success: false, message: "ID giảng viên không hợp lệ" });
            }

            const teacher = await User.findOne({
                _id: teacherId,
                role: "teacher",
                isDeleted: false,
                isActive: true
            });

            if (!teacher) {
                return res.status(404).json({ success: false, message: "Không tìm thấy giảng viên hợp lệ" });
            }

            courseSection.teacherId = teacherId;
        }

        if (semesterId) {
            if (!mongoose.Types.ObjectId.isValid(semesterId)) {
                return res.status(400).json({ success: false, message: "ID học kỳ không hợp lệ" });
            }

            const semester = await Semester.findOne({ _id: semesterId, isDeleted: false, isActive: true });
            if (!semester) {
                return res.status(404).json({ success: false, message: "Không tìm thấy học kỳ" });
            }

            courseSection.semesterId = semesterId;
        }

        if (roomId) {
            if (!mongoose.Types.ObjectId.isValid(roomId)) {
                return res.status(400).json({ success: false, message: "ID phòng học không hợp lệ" });
            }

            const room = await Room.findOne({ _id: roomId, isDeleted: false, isActive: true });
            if (!room) {
                return res.status(404).json({ success: false, message: "Không tìm thấy phòng học" });
            }

            courseSection.roomId = roomId;
        }

        if (code && code.trim().toUpperCase() !== courseSection.code) {
            const codeExists = await CourseSection.findOne({
                code: code.trim().toUpperCase(),
                isDeleted: false,
                _id: { $ne: id }
            });

            if (codeExists) {
                return res.status(409).json({
                    success: false,
                    message: "Mã lớp học phần đã tồn tại"
                });
            }

            courseSection.code = code;
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Tên lớp học phần không được để trống"
                });
            }

            courseSection.name = name;
        }

        if (maxStudents !== undefined) {
            const maxStudentNumber = Number(maxStudents);

            if (!Number.isInteger(maxStudentNumber) || maxStudentNumber < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Số lượng sinh viên tối đa phải là số nguyên lớn hơn hoặc bằng 1"
                });
            }

            courseSection.maxStudents = maxStudentNumber;
        }

        if (description !== undefined) {
            courseSection.description = description;
        }

        await courseSection.save();

        const updatedCourseSection = await CourseSection.findById(courseSection._id)
            .populate("subjectId", "code name credits")
            .populate("teacherId", "username displayName email role")
            .populate("semesterId", "name startDate endDate")
            .populate("roomId", "code name building capacity")
            .select("-__v");

        return res.status(200).json({
            success: true,
            message: "Cập nhật lớp học phần thành công",
            data: updatedCourseSection
        });
    } catch (error) {
        console.error("updateCourseSection:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteCourseSection = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp học phần không hợp lệ" });
        }

        const courseSection = await CourseSection.findOne({ _id: id, isDeleted: false });

        if (!courseSection) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp học phần" });
        }

        courseSection.isDeleted = true;
        await courseSection.save();

        return res.status(200).json({
            success: true,
            message: "Xóa lớp học phần thành công"
        });
    } catch (error) {
        console.error("deleteCourseSection:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const lockCourseSection = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp học phần không hợp lệ" });
        }

        const courseSection = await CourseSection.findOne({ _id: id, isDeleted: false });

        if (!courseSection) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp học phần" });
        }

        courseSection.isActive = false;
        await courseSection.save();

        return res.status(200).json({
            success: true,
            message: "Khóa lớp học phần thành công"
        });
    } catch (error) {
        console.error("lockCourseSection:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const unlockCourseSection = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp học phần không hợp lệ" });
        }

        const courseSection = await CourseSection.findOne({ _id: id, isDeleted: false });

        if (!courseSection) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp học phần" });
        }

        courseSection.isActive = true;
        await courseSection.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa lớp học phần thành công"
        });
    } catch (error) {
        console.error("unlockCourseSection:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const openCourseSectionRegistration = async (req, res) => {
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
        });

        if (!courseSection) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lớp học phần"
            });
        }

        if (courseSection.registrationStatus === "open") {
            return res.status(400).json({
                success: false,
                message: "Lớp học phần đã mở đăng ký"
            });
        }

        courseSection.registrationStatus = "open";

        await courseSection.save();

        return res.status(200).json({
            success: true,
            message: "Mở đăng ký lớp học phần thành công",
            data: courseSection
        });

    } catch (error) {
        console.error("openCourseSectionRegistration:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const closeCourseSectionRegistration = async (req, res) => {
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
        });

        if (!courseSection) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy lớp học phần"
            });
        }

        if (courseSection.registrationStatus === "closed") {
            return res.status(400).json({
                success: false,
                message: "Lớp học phần đã đóng đăng ký"
            });
        }

        courseSection.registrationStatus = "closed";

        await courseSection.save();

        return res.status(200).json({
            success: true,
            message: "Đóng đăng ký lớp học phần thành công",
            data: courseSection
        });

    } catch (error) {
        console.error("closeCourseSectionRegistration:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};