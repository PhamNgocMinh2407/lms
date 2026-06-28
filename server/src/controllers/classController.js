import mongoose from "mongoose";
import ClassModel from "../models/Class.js";
import Major from "../models/Major.js";

export const getAllClasses = async (req, res) => {
    try {
        const { keyword, majorId } = req.query;

        const filter = { isDeleted: false };

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { code: { $regex: keyword, $options: "i" } }
            ];
        }

        if (majorId) {
            if (!mongoose.Types.ObjectId.isValid(majorId)) {
                return res.status(400).json({ success: false, message: "ID ngành không hợp lệ" });
            }

            filter.majorId = majorId;
        }

        const classes = await ClassModel.find(filter)
            .populate("majorId", "code name")
            .select("-__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách lớp thành công",
            count: classes.length,
            data: classes
        });
    } catch (error) {
        console.error("getAllClasses:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getClassById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp không hợp lệ" });
        }

        const classItem = await ClassModel.findOne({ _id: id, isDeleted: false })
            .populate("majorId", "code name")
            .select("-__v");

        if (!classItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp" });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin lớp thành công",
            data: classItem
        });
    } catch (error) {
        console.error("getClassById:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const createClass = async (req, res) => {
    try {
        const { majorId, code, name, cohort, description } = req.body || {};

        if (!majorId || !code || !name) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ ngành, mã lớp và tên lớp"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(majorId)) {
            return res.status(400).json({ success: false, message: "ID ngành không hợp lệ" });
        }

        const major = await Major.findOne({ _id: majorId, isDeleted: false });

        if (!major) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
        }

        const exists = await ClassModel.findOne({
            code: code.trim().toUpperCase(),
            isDeleted: false
        });

        if (exists) {
            return res.status(409).json({ success: false, message: "Mã lớp đã tồn tại" });
        }

        const classItem = await ClassModel.create({
            majorId,
            code,
            name,
            cohort,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo lớp thành công",
            data: classItem
        });
    } catch (error) {
        console.error("createClass:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { majorId, code, name, cohort, description } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp không hợp lệ" });
        }

        const classItem = await ClassModel.findOne({ _id: id, isDeleted: false });

        if (!classItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp" });
        }

        if (majorId) {
            if (!mongoose.Types.ObjectId.isValid(majorId)) {
                return res.status(400).json({ success: false, message: "ID ngành không hợp lệ" });
            }

            const major = await Major.findOne({ _id: majorId, isDeleted: false });

            if (!major) {
                return res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
            }

            classItem.majorId = majorId;
        }

        if (code && code.trim().toUpperCase() !== classItem.code) {
            const exists = await ClassModel.findOne({
                code: code.trim().toUpperCase(),
                isDeleted: false,
                _id: { $ne: id }
            });

            if (exists) {
                return res.status(409).json({ success: false, message: "Mã lớp đã tồn tại" });
            }

            classItem.code = code;
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ success: false, message: "Tên lớp không được để trống" });
            }

            classItem.name = name;
        }

        if (cohort !== undefined) classItem.cohort = cohort;
        if (description !== undefined) classItem.description = description;

        await classItem.save();

        const updatedClass = await ClassModel.findById(classItem._id)
            .populate("majorId", "code name")
            .select("-__v");

        return res.status(200).json({
            success: true,
            message: "Cập nhật lớp thành công",
            data: updatedClass
        });
    } catch (error) {
        console.error("updateClass:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp không hợp lệ" });
        }

        const classItem = await ClassModel.findOne({ _id: id, isDeleted: false });

        if (!classItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp" });
        }

        classItem.isDeleted = true;
        await classItem.save();

        return res.status(200).json({
            success: true,
            message: "Xóa lớp thành công"
        });
    } catch (error) {
        console.error("deleteClass:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const lockClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp không hợp lệ" });
        }

        const classItem = await ClassModel.findOne({ _id: id, isDeleted: false });

        if (!classItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp" });
        }

        classItem.isActive = false;
        await classItem.save();

        return res.status(200).json({
            success: true,
            message: "Khóa lớp thành công"
        });
    } catch (error) {
        console.error("lockClass:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const unlockClass = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID lớp không hợp lệ" });
        }

        const classItem = await ClassModel.findOne({ _id: id, isDeleted: false });

        if (!classItem) {
            return res.status(404).json({ success: false, message: "Không tìm thấy lớp" });
        }

        classItem.isActive = true;
        await classItem.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa lớp thành công"
        });
    } catch (error) {
        console.error("unlockClass:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};