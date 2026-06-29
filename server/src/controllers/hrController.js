import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";

const STAFF_ROLES = ["hr", "teacher", "tbm", "pdt"];
const HR_MANAGEABLE_ROLES = ["teacher", "student"];

export const getAllStaffs = async (req, res) => {
    try {
        const staffs = await User.find({
            role: { $in: STAFF_ROLES },
            isDeleted: false
        })
            .select("-hashedPassword -__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách nhân sự thành công",
            count: staffs.length,
            data: staffs
        });

    } catch (error) {
        console.error("getAllStaffs:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getHRDashboard = async (req, res) => {
    try {
        const [
            totalStaffs,
            activeStaffs,
            lockedStaffs,
            hrCount,
            teacherCount,
            tbmCount,
            pdtCount,
            studentCount
        ] = await Promise.all([
            User.countDocuments({
                role: { $in: STAFF_ROLES },
                isDeleted: false
            }),

            User.countDocuments({
                role: { $in: STAFF_ROLES },
                isDeleted: false,
                isActive: true
            }),

            User.countDocuments({
                role: { $in: STAFF_ROLES },
                isDeleted: false,
                isActive: false
            }),

            User.countDocuments({ role: "hr", isDeleted: false }),
            User.countDocuments({ role: "teacher", isDeleted: false }),
            User.countDocuments({ role: "tbm", isDeleted: false }),
            User.countDocuments({ role: "pdt", isDeleted: false }),
            User.countDocuments({ role: "student", isDeleted: false })
        ]);

        return res.status(200).json({
            success: true,
            message: "Lấy thống kê HR thành công",
            data: {
                totalStaffs,
                activeStaffs,
                lockedStaffs,
                roles: {
                    hr: hrCount,
                    teacher: teacherCount,
                    tbm: tbmCount,
                    pdt: pdtCount,
                    student: studentCount
                }
            }
        });

    } catch (error) {
        console.error("getHRDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getHRStudents = async (req, res) => {
    try {
        const students = await User.find({
            role: "student",
            isDeleted: false
        })
            .select("-hashedPassword -__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách sinh viên thành công",
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error("getHRStudents:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const createHRUser = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            displayName,
            DisplayName,
            phone,
            bio,
            role
        } = req.body || {};

        const finalDisplayName = displayName || DisplayName;

        if (!username || !email || !password || !finalDisplayName || !role) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ username, email, mật khẩu, họ tên và vai trò"
            });
        }

        if (!HR_MANAGEABLE_ROLES.includes(role)) {
            return res.status(403).json({
                success: false,
                message: "HR chỉ được tạo tài khoản giảng viên hoặc sinh viên"
            });
        }

        const existedUser = await User.findOne({
            $or: [
                { username: username.toLowerCase() },
                { email: email.toLowerCase() }
            ],
            isDeleted: false
        });

        if (existedUser) {
            return res.status(409).json({
                success: false,
                message: "Username hoặc email đã tồn tại"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            hashedPassword,
            DisplayName: finalDisplayName,
            phone,
            bio,
            role
        });

        const safeUser = await User.findById(user._id).select("-hashedPassword -__v");

        return res.status(201).json({
            success: true,
            message: "HR tạo tài khoản thành công",
            data: safeUser
        });

    } catch (error) {
        console.error("createHRUser:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const updateHRUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            email,
            displayName,
            DisplayName,
            phone,
            bio,
            isActive
        } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID người dùng không hợp lệ"
            });
        }

        const user = await User.findOne({
            _id: id,
            role: { $in: HR_MANAGEABLE_ROLES },
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy giảng viên hoặc sinh viên"
            });
        }

        if (email !== undefined) {
            const existedEmail = await User.findOne({
                _id: { $ne: id },
                email: email.toLowerCase(),
                isDeleted: false
            });

            if (existedEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email đã tồn tại"
                });
            }

            user.email = email.toLowerCase();
        }

        if (displayName || DisplayName) {
            user.DisplayName = displayName || DisplayName;
        }

        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        const safeUser = await User.findById(user._id).select("-hashedPassword -__v");

        return res.status(200).json({
            success: true,
            message: "Cập nhật thông tin người dùng thành công",
            data: safeUser
        });

    } catch (error) {
        console.error("updateHRUser:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};