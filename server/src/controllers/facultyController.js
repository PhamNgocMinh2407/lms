import Faculty from "../models/Faculty.js";

export const getAllFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find({ isDeleted: false })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách khoa thành công",
            count: faculties.length,
            data: faculties
        });

    } catch (error) {
        console.error("getAllFaculties:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const createFaculty = async (req, res) => {
    try {
        const { code, name, description } = req.body || {};

        if (!code || !name) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập mã khoa và tên khoa"
            });
        }

        const codeExists = await Faculty.findOne({
            code: code.trim().toUpperCase(),
            isDeleted: false
        });

        if (codeExists) {
            return res.status(409).json({
                success: false,
                message: "Mã khoa đã tồn tại"
            });
        }

        const faculty = await Faculty.create({
            code,
            name,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo khoa thành công",
            data: faculty
        });

    } catch (error) {
        console.error("createFaculty:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};