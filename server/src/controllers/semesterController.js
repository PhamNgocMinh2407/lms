import mongoose from "mongoose";
import Semester from "../models/Semester.js";
import AcademicYear from "../models/AcademicYear.js";

export const getAllSemesters = async (req, res) => {
    try {
        const { keyword, academicYearId } = req.query;

        const filter = {
            isDeleted: false
        };

        if (keyword) {
            filter.name = {
                $regex: keyword,
                $options: "i"
            };
        }

        if (academicYearId) {
            if (!mongoose.Types.ObjectId.isValid(academicYearId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID năm học không hợp lệ"
                });
            }

            filter.academicYearId = academicYearId;
        }

        const semesters = await Semester.find(filter)
            .populate("academicYearId", "name startDate endDate")
            .select("-__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách học kỳ thành công",
            count: semesters.length,
            data: semesters
        });
    } catch (error) {
        console.error("getAllSemesters:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getSemesterById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID học kỳ không hợp lệ"
            });
        }

        const semester = await Semester.findOne({
            _id: id,
            isDeleted: false
        })
            .populate("academicYearId", "name startDate endDate")
            .select("-__v");

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy học kỳ"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin học kỳ thành công",
            data: semester
        });
    } catch (error) {
        console.error("getSemesterById:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const createSemester = async (req, res) => {
    try {
        const { academicYearId, name, startDate, endDate } = req.body || {};

        if (!academicYearId || !name || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ năm học, tên học kỳ, ngày bắt đầu và ngày kết thúc"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(academicYearId)) {
            return res.status(400).json({
                success: false,
                message: "ID năm học không hợp lệ"
            });
        }

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"
            });
        }

        const academicYear = await AcademicYear.findOne({
            _id: academicYearId,
            isDeleted: false
        });

        if (!academicYear) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy năm học"
            });
        }

        const exists = await Semester.findOne({
            academicYearId,
            name: name.trim(),
            isDeleted: false
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Học kỳ này đã tồn tại trong năm học"
            });
        }

        const semester = await Semester.create({
            academicYearId,
            name,
            startDate,
            endDate
        });

        return res.status(201).json({
            success: true,
            message: "Tạo học kỳ thành công",
            data: semester
        });
    } catch (error) {
        console.error("createSemester:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const updateSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const { academicYearId, name, startDate, endDate } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID học kỳ không hợp lệ"
            });
        }

        const semester = await Semester.findOne({
            _id: id,
            isDeleted: false
        });

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy học kỳ"
            });
        }

        if (academicYearId) {
            if (!mongoose.Types.ObjectId.isValid(academicYearId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID năm học không hợp lệ"
                });
            }

            const academicYear = await AcademicYear.findOne({
                _id: academicYearId,
                isDeleted: false
            });

            if (!academicYear) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy năm học"
                });
            }

            semester.academicYearId = academicYearId;
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Tên học kỳ không được để trống"
                });
            }

            semester.name = name;
        }

        if (startDate !== undefined) {
            semester.startDate = startDate;
        }

        if (endDate !== undefined) {
            semester.endDate = endDate;
        }

        if (new Date(semester.startDate) >= new Date(semester.endDate)) {
            return res.status(400).json({
                success: false,
                message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"
            });
        }

        await semester.save();

        const updatedSemester = await Semester.findById(semester._id)
            .populate("academicYearId", "name startDate endDate")
            .select("-__v");

        return res.status(200).json({
            success: true,
            message: "Cập nhật học kỳ thành công",
            data: updatedSemester
        });
    } catch (error) {
        console.error("updateSemester:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteSemester = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID học kỳ không hợp lệ"
            });
        }

        const semester = await Semester.findOne({
            _id: id,
            isDeleted: false
        });

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy học kỳ"
            });
        }

        semester.isDeleted = true;
        await semester.save();

        return res.status(200).json({
            success: true,
            message: "Xóa học kỳ thành công"
        });
    } catch (error) {
        console.error("deleteSemester:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};