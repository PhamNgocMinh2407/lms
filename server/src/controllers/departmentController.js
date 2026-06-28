import mongoose from "mongoose";
import Department from "../models/Department.js";
import Faculty from "../models/Faculty.js";

export const getAllDepartments = async (req, res) => {
    try {
        console.log("Query nhận được:", req.query);
        const { keyword, facultyId } = req.query;

        const filter = {
            isDeleted: false
        };

        if (keyword) {
            filter.$or = [
                {
                    name: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    code: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
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

        const departments = await Department.find(filter)
            .populate("facultyId", "code name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách bộ môn thành công",
            count: departments.length,
            data: departments
        });

    } catch (error) {
        console.error("getAllDepartments:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const createDepartment = async (req, res) => {
    try {
        const { facultyId, code, name, description } = req.body || {};

        if (!facultyId || !code || !name) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ khoa, mã bộ môn và tên bộ môn"
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

        const codeExists = await Department.findOne({
            code: code.trim().toUpperCase(),
            isDeleted: false
        });

        if (codeExists) {
            return res.status(409).json({
                success: false,
                message: "Mã bộ môn đã tồn tại"
            });
        }

        const department = await Department.create({
            facultyId,
            code,
            name,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo bộ môn thành công",
            data: department
        });

    } catch (error) {
        console.error("createDepartment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID bộ môn không hợp lệ"
            });
        }

        const department = await Department.findOne({
            _id: id,
            isDeleted: false
        }).populate("facultyId", "code name");

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bộ môn"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin bộ môn thành công",
            data: department
        });

    } catch (error) {
        console.error("getDepartmentById:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { facultyId, code, name, description } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID bộ môn không hợp lệ"
            });
        }

        const department = await Department.findOne({
            _id: id,
            isDeleted: false
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bộ môn"
            });
        }

        if (facultyId) {
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

            department.facultyId = facultyId;
        }

        if (code && code.trim().toUpperCase() !== department.code) {
            const codeExists = await Department.findOne({
                code: code.trim().toUpperCase(),
                isDeleted: false,
                _id: { $ne: id }
            });

            if (codeExists) {
                return res.status(409).json({
                    success: false,
                    message: "Mã bộ môn đã tồn tại"
                });
            }

            department.code = code;
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Tên bộ môn không được để trống"
                });
            }

            department.name = name;
        }

        if (description !== undefined) {
            department.description = description;
        }

        await department.save();

        const updatedDepartment = await Department.findById(department._id)
            .populate("facultyId", "code name");

        return res.status(200).json({
            success: true,
            message: "Cập nhật bộ môn thành công",
            data: updatedDepartment
        });

    } catch (error) {
        console.error("updateDepartment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID bộ môn không hợp lệ"
            });
        }

        const department = await Department.findOne({
            _id: id,
            isDeleted: false
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bộ môn"
            });
        }

        department.isDeleted = true;
        await department.save();

        return res.status(200).json({
            success: true,
            message: "Xóa bộ môn thành công"
        });

    } catch (error) {
        console.error("deleteDepartment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const lockDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID bộ môn không hợp lệ"
            });
        }

        const department = await Department.findOne({
            _id: id,
            isDeleted: false
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bộ môn"
            });
        }

        department.isActive = false;
        await department.save();

        return res.status(200).json({
            success: true,
            message: "Khóa bộ môn thành công"
        });

    } catch (error) {
        console.error("lockDepartment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const unlockDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID bộ môn không hợp lệ"
            });
        }

        const department = await Department.findOne({
            _id: id,
            isDeleted: false
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bộ môn"
            });
        }

        department.isActive = true;
        await department.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa bộ môn thành công"
        });

    } catch (error) {
        console.error("unlockDepartment:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};