import mongoose from "mongoose";
import AcademicYear from "../models/AcademicYear.js";

export const getAllAcademicYears = async (req, res) => {
    try {
        const { keyword } = req.query;

        const filter = {
            isDeleted: false
        };

        if (keyword) {
            filter.name = {
                $regex: keyword,
                $options: "i"
            };
        }

        const academicYears = await AcademicYear.find(filter)
            .select("-__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách năm học thành công",
            count: academicYears.length,
            data: academicYears
        });
    } catch (error) {
        console.error("getAllAcademicYears:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getAcademicYearById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID năm học không hợp lệ" });
        }

        const academicYear = await AcademicYear.findOne({
            _id: id,
            isDeleted: false
        }).select("-__v");

        if (!academicYear) {
            return res.status(404).json({ success: false, message: "Không tìm thấy năm học" });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin năm học thành công",
            data: academicYear
        });
    } catch (error) {
        console.error("getAcademicYearById:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const createAcademicYear = async (req, res) => {
    try {
        const { name, startDate, endDate } = req.body || {};

        if (!name || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ tên năm học, ngày bắt đầu và ngày kết thúc"
            });
        }

        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"
            });
        }

        const exists = await AcademicYear.findOne({
            name: name.trim(),
            isDeleted: false
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Năm học đã tồn tại"
            });
        }

        const academicYear = await AcademicYear.create({
            name,
            startDate,
            endDate
        });

        return res.status(201).json({
            success: true,
            message: "Tạo năm học thành công",
            data: academicYear
        });
    } catch (error) {
        console.error("createAcademicYear:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const updateAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, startDate, endDate } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID năm học không hợp lệ" });
        }

        const academicYear = await AcademicYear.findOne({
            _id: id,
            isDeleted: false
        });

        if (!academicYear) {
            return res.status(404).json({ success: false, message: "Không tìm thấy năm học" });
        }

        if (name && name.trim() !== academicYear.name) {
            const exists = await AcademicYear.findOne({
                name: name.trim(),
                isDeleted: false,
                _id: { $ne: id }
            });

            if (exists) {
                return res.status(409).json({
                    success: false,
                    message: "Năm học đã tồn tại"
                });
            }

            academicYear.name = name;
        }

        if (startDate !== undefined) {
            academicYear.startDate = startDate;
        }

        if (endDate !== undefined) {
            academicYear.endDate = endDate;
        }

        if (new Date(academicYear.startDate) >= new Date(academicYear.endDate)) {
            return res.status(400).json({
                success: false,
                message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc"
            });
        }

        await academicYear.save();

        return res.status(200).json({
            success: true,
            message: "Cập nhật năm học thành công",
            data: academicYear
        });
    } catch (error) {
        console.error("updateAcademicYear:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteAcademicYear = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID năm học không hợp lệ" });
        }

        const academicYear = await AcademicYear.findOne({
            _id: id,
            isDeleted: false
        });

        if (!academicYear) {
            return res.status(404).json({ success: false, message: "Không tìm thấy năm học" });
        }

        academicYear.isDeleted = true;
        await academicYear.save();

        return res.status(200).json({
            success: true,
            message: "Xóa năm học thành công"
        });
    } catch (error) {
        console.error("deleteAcademicYear:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};