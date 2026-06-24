import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const seedUsers = async () => {
    try {
        // Kết nối MongoDB
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

        console.log("Đã kết nối MongoDB");

        // Mật khẩu chung cho các tài khoản test
        const hashedPassword = await bcrypt.hash("123456", 10);

        const users = [
            {
                username: "student",
                email: "student@gmail.com",
                hashedPassword,
                DisplayName: "Tài khoản Student",
                role: "student"
            },
            {
                username: "admin",
                email: "admin@gmail.com",
                hashedPassword,
                DisplayName: "Tài khoản Admin",
                role: "admin"
            },
            {
                username: "hr",
                email: "hr@gmail.com",
                hashedPassword,
                DisplayName: "Tài khoản HR",
                role: "hr"
            },
            {
                username: "ht",
                email: "ht@gmail.com",
                hashedPassword,
                DisplayName: "Tài khoản Hiệu trưởng",
                role: "ht"
            },
            {
                username: "tbm",
                email: "tbm@gmail.com",
                hashedPassword,
                DisplayName: "Tài khoản Trưởng bộ môn",
                role: "tbm"
            },
            {
                username: "pdt",
                email: "pdt@gmail.com",
                hashedPassword,
                DisplayName: "Tài khoản Phòng đào tạo",
                role: "pdt"
            },
            {
                username: "teacher",
                email: "teacher@gmail.com",
                hashedPassword,
                DisplayName: "Tài khoản Giáo viên",
                role: "teacher"
            }
        ];

        // Xóa các user test cũ để không bị lỗi email/username trùng
        await User.deleteMany({
            email: {
                $in: users.map((user) => user.email)
            }
        });

        // Tạo user mới
        await User.insertMany(users);

        console.log("Seed 7 tài khoản thành công");
        console.log("Mật khẩu chung: 123456");

        process.exit(0);
    } catch (error) {
        console.error("Seed user thất bại:", error);
        process.exit(1);
    }
};

seedUsers();