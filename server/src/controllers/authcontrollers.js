import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m"; 
// 14 ngày quy đổi ra milliseconds
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; 

export const signIn = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. Kiểm tra đầu vào
        if (!username || !password) {
            return res
                .status(400)
                .json({ message: "Vui lòng điền đầy đủ thông tin" });
        }

        // 2. Tìm user trong database
        const user = await User.findOne({ username });
        if (!user) {
            return res
                .status(401)
                .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }

        // 3. Kiểm tra mật khẩu
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordCorrect) {
            return res
                .status(401)
                .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
        }

        // 4. Tạo Access Token (JWT)
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role }, // Nên đưa cả role vào payload JWT nếu cần bảo mật ở middleware
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: ACCESS_TOKEN_TTL }
        );

        // 5. Tạo Refresh Token ngẫu nhiên (Opaque Token)
        const refreshToken = crypto.randomBytes(64).toString("hex");

        // 6. Lưu Session vào Database Atlas
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        // 7. Gửi Refresh Token về qua HTTP-Only Cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Môi trường dev (localhost) có thể để false nếu không dùng https, production bắt buộc true
            sameSite: "lax", // Hoặc "none" nếu client và server khác domain hoàn toàn (cross-site)
            maxAge: REFRESH_TOKEN_TTL,
        });

        // 8. Trả thông tin về cho Client 
        return res.status(200).json({
            message: `user ${user.DisplayName || user.username} đã đăng nhập thành công`, 
            accessToken,
            userId: user._id,
            role: user.role // QUAN TRỌNG: Để Zustand và Route điều hướng hoạt động đúng
        });

    } catch (error) {
        console.error("lỗi khi gọi signIn", error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi đăng nhập" });
    }
};

export const signOut = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;
        
        // SỬA LỖI: Nếu CÓ token thì mới vào DB để xóa
        if (token) {
            await Session.deleteOne({ refreshToken: token });
        }
        
        // Xóa cookie refresh token ở trình duyệt
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        }); 
        
        return res.sendStatus(204); // Trả về 204 No Content thành công
    }
    catch (error) {
        console.error("lỗi khi gọi signOut", error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi đăng xuất" });
    }
};