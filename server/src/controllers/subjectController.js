import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import Department from "../models/Department.js";
import Major from "../models/Major.js";

export const getAllSubjects = async (req, res) => {
    try {
        const { keyword, departmentId, majorId } = req.query;

        const filter = { isDeleted: false };

        if (keyword) {
            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { code: { $regex: keyword, $options: "i" } }
            ];
        }

        if (departmentId) {
            if (!mongoose.Types.ObjectId.isValid(departmentId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID bộ môn không hợp lệ"
                });
            }

            filter.departmentId = departmentId;
        }

        if (majorId) {
            if (!mongoose.Types.ObjectId.isValid(majorId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID ngành không hợp lệ"
                });
            }

            filter.majorId = majorId;
        }

        const subjects = await Subject.find(filter)
            .populate("departmentId", "code name")
            .populate("majorId", "code name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách môn học thành công",
            count: subjects.length,
            data: subjects
        });

    } catch (error) {
        console.error("getAllSubjects:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID môn học không hợp lệ"
            });
        }

        const subject = await Subject.findOne({
            _id: id,
            isDeleted: false
        })
            .populate("departmentId", "code name")
            .populate("majorId", "code name");

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin môn học thành công",
            data: subject
        });

    } catch (error) {
        console.error("getSubjectById:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const createSubject = async (req, res) => {
    try {
        const {
            departmentId,
            majorId,
            code,
            name,
            credits,
            description
        } = req.body || {};

        if (!departmentId || !majorId || !code || !name || credits === undefined) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ bộ môn, ngành, mã môn, tên môn và số tín chỉ"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "ID bộ môn không hợp lệ"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(majorId)) {
            return res.status(400).json({
                success: false,
                message: "ID ngành không hợp lệ"
            });
        }

        const creditNumber = Number(credits);

        if (!Number.isInteger(creditNumber) || creditNumber < 1) {
            return res.status(400).json({
                success: false,
                message: "Số tín chỉ phải là số nguyên lớn hơn hoặc bằng 1"
            });
        }

        const department = await Department.findOne({
            _id: departmentId,
            isDeleted: false
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bộ môn"
            });
        }

        const major = await Major.findOne({
            _id: majorId,
            isDeleted: false
        });

        if (!major) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy ngành học"
            });
        }

        const codeExists = await Subject.findOne({
            code: code.trim().toUpperCase(),
            isDeleted: false
        });

        if (codeExists) {
            return res.status(409).json({
                success: false,
                message: "Mã môn học đã tồn tại"
            });
        }

        const subject = await Subject.create({
            departmentId,
            majorId,
            code,
            name,
            credits: creditNumber,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo môn học thành công",
            data: subject
        });

    } catch (error) {
        console.error("createSubject:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            departmentId,
            majorId,
            code,
            name,
            credits,
            description
        } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID môn học không hợp lệ"
            });
        }

        const subject = await Subject.findOne({
            _id: id,
            isDeleted: false
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        if (departmentId) {
            if (!mongoose.Types.ObjectId.isValid(departmentId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID bộ môn không hợp lệ"
                });
            }

            const department = await Department.findOne({
                _id: departmentId,
                isDeleted: false
            });

            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy bộ môn"
                });
            }

            subject.departmentId = departmentId;
        }

        if (majorId) {
            if (!mongoose.Types.ObjectId.isValid(majorId)) {
                return res.status(400).json({
                    success: false,
                    message: "ID ngành không hợp lệ"
                });
            }

            const major = await Major.findOne({
                _id: majorId,
                isDeleted: false
            });

            if (!major) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy ngành học"
                });
            }

            subject.majorId = majorId;
        }

        if (code && code.trim().toUpperCase() !== subject.code) {
            const codeExists = await Subject.findOne({
                code: code.trim().toUpperCase(),
                isDeleted: false,
                _id: { $ne: id }
            });

            if (codeExists) {
                return res.status(409).json({
                    success: false,
                    message: "Mã môn học đã tồn tại"
                });
            }

            subject.code = code;
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Tên môn học không được để trống"
                });
            }

            subject.name = name;
        }

        if (credits !== undefined) {
            const creditNumber = Number(credits);

            if (!Number.isInteger(creditNumber) || creditNumber < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Số tín chỉ phải là số nguyên lớn hơn hoặc bằng 1"
                });
            }

            subject.credits = creditNumber;
        }

        if (description !== undefined) {
            subject.description = description;
        }

        await subject.save();

        const updatedSubject = await Subject.findById(subject._id)
            .populate("departmentId", "code name")
            .populate("majorId", "code name");

        return res.status(200).json({
            success: true,
            message: "Cập nhật môn học thành công",
            data: updatedSubject
        });

    } catch (error) {
        console.error("updateSubject:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID môn học không hợp lệ"
            });
        }

        const subject = await Subject.findOne({
            _id: id,
            isDeleted: false
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        subject.isDeleted = true;
        await subject.save();

        return res.status(200).json({
            success: true,
            message: "Xóa môn học thành công"
        });

    } catch (error) {
        console.error("deleteSubject:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const lockSubject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID môn học không hợp lệ"
            });
        }

        const subject = await Subject.findOne({
            _id: id,
            isDeleted: false
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        subject.isActive = false;
        await subject.save();

        return res.status(200).json({
            success: true,
            message: "Khóa môn học thành công"
        });

    } catch (error) {
        console.error("lockSubject:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const unlockSubject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID môn học không hợp lệ"
            });
        }

        const subject = await Subject.findOne({
            _id: id,
            isDeleted: false
        });

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy môn học"
            });
        }

        subject.isActive = true;
        await subject.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa môn học thành công"
        });

    } catch (error) {
        console.error("unlockSubject:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};