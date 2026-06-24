import bcrypt from "bcrypt";
import User from "../models/User.js";

export const createUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, role } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ thông tin"
            });
        }

        // Các role được phép trong User model
        const allowedRoles = [
            "student",
            "admin",
            "hr",
            "ht",
            "tbm",
            "pdt",
            "teacher"
        ];

        // Nếu không gửi role thì mặc định là student
        const userRole = role ? role.toLowerCase().trim() : "student";

        // Kiểm tra role hợp lệ
        if (!allowedRoles.includes(userRole)) {
            return res.status(400).json({
                message: "Role không hợp lệ"
            });
        }

        // Chuẩn hóa email và username
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();

        // Kiểm tra email đã tồn tại
        const duplicateEmail = await User.findOne({
            email: normalizedEmail
        });

        if (duplicateEmail) {
            return res.status(409).json({
                message: "Email đã tồn tại"
            });
        }

        // Kiểm tra username đã tồn tại
        const duplicateUsername = await User.findOne({
            username: normalizedUsername
        });

        if (duplicateUsername) {
            return res.status(409).json({
                message: "Tên đăng nhập đã tồn tại"
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user
        const newUser = await User.create({
            username: normalizedUsername,
            hashedPassword,
            email: normalizedEmail,
            DisplayName: `${firstName.trim()} ${lastName.trim()}`,
            role: userRole
        });

        return res.status(201).json({
            message: "Tạo tài khoản thành công",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                DisplayName: newUser.DisplayName,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error("Lỗi khi gọi createUser:", error);

        return res.status(500).json({
            message: "Có lỗi xảy ra khi đăng ký"
        });
    }
};