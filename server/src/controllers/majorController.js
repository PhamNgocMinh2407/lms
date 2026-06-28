import mongoose from "mongoose";
import Major from "../models/Major.js";
import Faculty from "../models/Faculty.js";

export const getAllMajors = async (req, res) => {
    try {
        const { keyword, facultyId } = req.query;

        const filter = {
            isDeleted: false
        };

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { code: { $regex: keyword, $options: "i" } }
            ];
        }

        if (facultyId) {
            if (!mongoose.Types.ObjectId.isValid(facultyId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID khoa không hợp lệ"
                });
            }

            filter.facultyId = facultyId;
        }

        const majors = await Major.find(filter)
            .populate("facultyId", "code name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách ngành học thành công",
            count: majors.length,
            data: majors
        });

    } catch (error) {
        console.error("getAllMajors:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const createMajor = async (req, res) => {
    try {
        const { facultyId, code, name, description } = req.body || {};

        if (!facultyId || !code || !name) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ khoa, mã ngành và tên ngành"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(facultyId)) {
            return res.status(400).json({
                success: false,
                message: "ID khoa không hợp lệ"
            });
        }

        const faculty = await Faculty.findOne({
            _id: facultyId,
            isDeleted: false
        });

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy khoa"
            });
        }

        const codeExists = await Major.findOne({
            code: code.trim().toUpperCase(),
            isDeleted: false
        });

        if (codeExists) {
            return res.status(409).json({
                success: false,
                message: "Mã ngành đã tồn tại"
            });
        }

        const major = await Major.create({
            facultyId,
            code,
            name,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo ngành học thành công",
            data: major
        });

    } catch (error) {
        console.error("createMajor:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const getMajorById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID ngành không hợp lệ"
            });
        }

        const major = await Major.findOne({
            _id: id,
            isDeleted: false
        }).populate("facultyId", "code name");

        if (!major) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy ngành học"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin ngành học thành công",
            data: major
        });

    } catch (error) {
        console.error("getMajorById:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const updateMajor = async (req, res) => {
    try {
        const { id } = req.params;
        const { facultyId, code, name, description } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID ngành không hợp lệ" });
        }

        const major = await Major.findOne({ _id: id, isDeleted: false });

        if (!major) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
        }

        if (facultyId) {
            if (!mongoose.Types.ObjectId.isValid(facultyId)) {
                return res.status(400).json({ success: false, message: "ID khoa không hợp lệ" });
            }

            const faculty = await Faculty.findOne({ _id: facultyId, isDeleted: false });

            if (!faculty) {
                return res.status(404).json({ success: false, message: "Không tìm thấy khoa" });
            }

            major.facultyId = facultyId;
        }

        if (code && code.trim().toUpperCase() !== major.code) {
            const codeExists = await Major.findOne({
                code: code.trim().toUpperCase(),
                isDeleted: false,
                _id: { $ne: id }
            });

            if (codeExists) {
                return res.status(409).json({ success: false, message: "Mã ngành đã tồn tại" });
            }

            major.code = code;
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({ success: false, message: "Tên ngành không được để trống" });
            }

            major.name = name;
        }

        if (description !== undefined) {
            major.description = description;
        }

        await major.save();

        const updatedMajor = await Major.findById(major._id).populate("facultyId", "code name");

        return res.status(200).json({
            success: true,
            message: "Cập nhật ngành học thành công",
            data: updatedMajor
        });

    } catch (error) {
        console.error("updateMajor:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteMajor = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID ngành không hợp lệ" });
        }

        const major = await Major.findOne({ _id: id, isDeleted: false });

        if (!major) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
        }

        major.isDeleted = true;
        await major.save();

        return res.status(200).json({
            success: true,
            message: "Xóa ngành học thành công"
        });

    } catch (error) {
        console.error("deleteMajor:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const lockMajor = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID ngành không hợp lệ" });
        }

        const major = await Major.findOne({ _id: id, isDeleted: false });

        if (!major) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
        }

        major.isActive = false;
        await major.save();

        return res.status(200).json({
            success: true,
            message: "Khóa ngành học thành công"
        });

    } catch (error) {
        console.error("lockMajor:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const unlockMajor = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID ngành không hợp lệ" });
        }

        const major = await Major.findOne({ _id: id, isDeleted: false });

        if (!major) {
            return res.status(404).json({ success: false, message: "Không tìm thấy ngành học" });
        }

        major.isActive = true;
        await major.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa ngành học thành công"
        });

    } catch (error) {
        console.error("unlockMajor:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};