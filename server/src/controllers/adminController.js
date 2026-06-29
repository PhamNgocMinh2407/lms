import User from "../models/User.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";


export const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isDeleted: false });

        const activeUsers = await User.countDocuments({
            isDeleted: false,
            isActive: true
        });

        const lockedUsers = await User.countDocuments({
            isDeleted: false,
            isActive: false
        });

        const deletedUsers = await User.countDocuments({
            isDeleted: true
        });

        const roles = await User.aggregate([
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        const roleStats = {
            admin: 0,
            student: 0,
            teacher: 0,
            hr: 0,
            ht: 0,
            tbm: 0,
            pdt: 0
        };

        roles.forEach((item) => {
            roleStats[item._id] = item.count;
        });

        return res.status(200).json({
            success: true,
            message: "Lấy thống kê admin thành công",
            data: {
                totalUsers,
                activeUsers,
                lockedUsers,
                deletedUsers,
                roles: roleStats
            }
        });

    } catch (error) {
        console.error("getAdminDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {

        const users = await User.find({ isDeleted: false })
            .select("-hashedPassword")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách người dùng thành công",
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error("getAllUsers:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getUserById = async (req, res) => {
    try {

        const { id } = req.params;

        // Kiểm tra ObjectId có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        // Tìm user
        const user = await User.findOne({
            _id: id,
            isDeleted: false
        }).select("-hashedPassword -__v");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin người dùng thành công",
            data: user
        });

    } catch (error) {

        console.error("getUserById:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }
};

export const createUser = async (req, res) => {
    try {

        const {
            username,
            password,
            email,
            displayName,
            role
        } = req.body;

        // 1. Kiểm tra dữ liệu
        if (!username || !password || !email || !displayName || !role) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        // 2. Danh sách role hợp lệ
        const allowedRoles = [
            "admin",
            "student",
            "teacher",
            "hr",
            "ht",
            "tbm",
            "pdt"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role không hợp lệ"
            });
        }

        // 3. Username đã tồn tại?
        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            return res.status(409).json({
                success: false,
                message: "Username đã tồn tại"
            });
        }

        // 4. Email đã tồn tại?
        const emailExists = await User.findOne({ email });

        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: "Email đã tồn tại"
            });
        }

        // 5. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 6. Tạo user
        const newUser = await User.create({
            username,
            email,
            hashedPassword,
            displayName: displayName,
            role,
            isActive: true,
            isDeleted: false
        });

        // 7. Trả kết quả
        return res.status(201).json({
            success: true,
            message: "Tạo tài khoản thành công",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                displayName: newUser.displayName,
                role: newUser.role
            }
        });

    } catch (error) {

        console.error("createUser:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }
};

export const updateUser = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        const {
            username,
            email,
            displayName,
            phone,
            bio
        } = req.body;

        const user = await User.findOne({
            _id: id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // kiểm tra username trùng
        if (username && username !== user.username) {

            const usernameExists = await User.findOne({
                username
            });

            if (usernameExists) {
                return res.status(409).json({
                    success: false,
                    message: "Username đã tồn tại"
                });
            }

            user.username = username;
        }

        // kiểm tra email trùng
        if (email && email !== user.email) {

            const emailExists = await User.findOne({
                email
            });

            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: "Email đã tồn tại"
                });
            }

            user.email = email;
        }

        if (displayName) {
            user.displayName = displayName;
        }

        if (phone !== undefined) {
            user.phone = phone;
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Cập nhật người dùng thành công",
            data: user
        });

    } catch (error) {

        console.error("updateUser:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }
};

export const deleteUser = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        const user = await User.findOne({
            _id: id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        // Không cho admin tự xóa chính mình
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Không thể xóa chính tài khoản đang đăng nhập"
            });
        }

        user.isDeleted = true;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Xóa tài khoản thành công"
        });

    } catch (error) {

        console.error("deleteUser:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });

    }
};
    
export const lockUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        const user = await User.findOne({
            _id: id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Không thể khóa chính tài khoản đang đăng nhập"
            });
        }

        user.isActive = false;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Khóa tài khoản thành công"
        });

    } catch (error) {
        console.error("lockUser:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const unlockUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        const user = await User.findOne({
            _id: id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        user.isActive = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa tài khoản thành công"
        });

    } catch (error) {
        console.error("unlockUser:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        const allowedRoles = [
            "admin",
            "student",
            "teacher",
            "hr",
            "ht",
            "tbm",
            "pdt"
        ];

        if (!role || !allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role không hợp lệ"
            });
        }

        const user = await User.findOne({
            _id: id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "Không thể đổi quyền chính tài khoản đang đăng nhập"
            });
        }

        user.role = role;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Đổi quyền người dùng thành công",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error("changeRole:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID không hợp lệ"
            });
        }

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập mật khẩu mới"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Mật khẩu mới phải có ít nhất 6 ký tự"
            });
        }

        const user = await User.findOne({
            _id: id,
            isDeleted: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy người dùng"
            });
        }

        user.hashedPassword = await bcrypt.hash(newPassword, 10);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Reset mật khẩu thành công",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                role: user.role
            }
        });

    } catch (error) {
        console.error("resetUserPassword:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};