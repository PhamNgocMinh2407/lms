import bcrypt from "bcrypt";
import User from "../models/User.js";

// ==========================================
// 1. CHỨC NĂNG TẠO USER (GIỮ NGUYÊN CỦA BẠN)
// ==========================================
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
            "ht",      // Hiệu Trưởng
            "tbm",     // Trưởng Bộ Môn
            "pdt",     // Phòng Đào Tạo
            "teacher"  // Giảng viên (Đồng bộ với 'teacher' trong DB của bạn)
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

// ==========================================
// 2. API CHO TỪNG CHỨC NĂNG PHÂN QUYỀN (DỮ LIỆU THẬT)
// ==========================================

// 👑 Chức năng: Hiệu trưởng (ht) -> Lấy số liệu thống kê tổng quan toàn trường
export const getPrincipalDashboard = async (req, res) => {
    try {
        // Đếm tổng số lượng của từng vai trò trong Database để làm báo cáo
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalTeachers = await User.countDocuments({ role: "teacher" });
        const totalStaffs = await User.countDocuments({ role: { $in: ["hr", "pdt", "tbm"] } });

        return res.status(200).json({
            message: "Lấy dữ liệu thống kê thành công cho Hiệu Trưởng",
            data: {
                summary: "Báo cáo tổng quan quy mô nhân sự và người học toàn trường.",
                stats: {
                    students: totalStudents,
                    teachers: totalTeachers,
                    staffs: totalStaffs,
                    totalUsers: totalStudents + totalTeachers + totalStaffs
                }
            }
        });
    } catch (error) {
        console.error("Lỗi getPrincipalDashboard:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu Hiệu trưởng" });
    }
};

// 🛠️ Chức năng: Admin (admin) -> Lấy danh sách tất cả tài khoản trong hệ thống để quản trị
export const getAdminDashboard = async (req, res) => {
    try {
        // Lấy tất cả user nhưng ẩn mật khẩu đi vì lý do bảo mật
        const allUsers = await User.find().select("-hashedPassword");

        return res.status(200).json({
            message: "Lấy danh sách người dùng thành công cho Admin",
            data: {
                totalAccounts: allUsers.length,
                users: allUsers
            }
        });
    } catch (error) {
        console.error("Lỗi getAdminDashboard:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu Admin" });
    }
};

// 💼 Chức năng: Khối Nhân sự (hr) -> Quản lý danh sách toàn bộ cán bộ, giảng viên trong trường
export const getHRDashboard = async (req, res) => {
    try {
        // Khối nhân sự chỉ quản lý nhân viên và giảng viên, không quản lý sinh viên
        const staffAndTeachers = await User.find({ 
            role: { $in: ["hr", "ht", "tbm", "pdt", "teacher"] } 
        }).select("-hashedPassword");

        return res.status(200).json({
            message: "Lấy danh sách cán bộ giảng viên thành công cho HR",
            data: {
                totalStaffs: staffAndTeachers.length,
                staffs: staffAndTeachers
            }
        });
    } catch (error) {
        console.error("Lỗi getHRDashboard:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu HR" });
    }
};

// 📚 Chức năng: Phòng Đào tạo (pdt) -> Quản lý danh sách toàn bộ sinh viên toàn trường
export const getTrainingDashboard = async (req, res) => {
    try {
        // Phòng đào tạo cần danh sách sinh viên để xếp lớp, quản lý học vụ
        const allStudents = await User.find({ role: "student" }).select("-hashedPassword");

        return res.status(200).json({
            message: "Lấy danh sách sinh viên thành công cho Phòng Đào Tạo",
            data: {
                totalStudents: allStudents.length,
                students: allStudents
            }
        });
    } catch (error) {
        console.error("Lỗi getTrainingDashboard:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu Phòng Đào tạo" });
    }
};

// 👔 Chức năng: Trưởng bộ môn (tbm) -> Quản lý riêng đội ngũ giảng viên (teacher)
export const getHeadDepartmentDashboard = async (req, res) => {
    try {
        // Trưởng bộ môn phụ trách phân công và quản lý các Giảng viên (teacher)
        const teachers = await User.find({ role: "teacher" }).select("-hashedPassword");

        return res.status(200).json({
            message: "Lấy danh sách giảng viên trực thuộc thành công cho Trưởng Bộ Môn",
            data: {
                departmentName: "Khoa Công Nghệ Thông Tin", // Tạm thời để cứng, sau này lấy theo ngành của TBM
                totalTeachers: teachers.length,
                teachers: teachers
            }
        });
    } catch (error) {
        console.error("Lỗi getHeadDepartmentDashboard:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu Trưởng bộ môn" });
    }
};

// 📝 Chức năng: Giảng viên (teacher) -> Xem thông tin hồ sơ giảng dạy cá nhân
export const getLecturerDashboard = async (req, res) => {
    try {
        // Lấy thông tin chi tiết của chính giảng viên đang đăng nhập dựa trên ID từ token truyền xuống
        const currentTeacher = await User.findById(req.user.userId).select("-hashedPassword");

        return res.status(200).json({
            message: "Lấy thông tin cá nhân giảng viên thành công",
            data: {
                profile: currentTeacher,
                assignedClasses: ["Lớp Cơ sở dữ liệu - Nhóm 1", "Lớp Web Nâng Cao - Nhóm 2"] // Giả lập dữ liệu lớp học, sau này sẽ query từ bảng Classes
            }
        });
    } catch (error) {
        console.error("Lỗi getLecturerDashboard:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu Giảng viên" });
    }
};

// 🎓 Chức năng: Sinh viên (student) -> Xem kết quả học tập và thông tin cá nhân sinh viên
export const getStudentDashboard = async (req, res) => {
    try {
        // Lấy thông tin chi tiết của chính sinh viên đang đăng nhập dựa trên ID từ token truyền xuống
        const currentStudent = await User.findById(req.user.userId).select("-hashedPassword");

        return res.status(200).json({
            message: "Lấy thông tin cá nhân sinh viên thành công",
            data: {
                profile: currentStudent,
                academicStatus: {
                    studentId: currentStudent._id.toString().slice(-8).toUpperCase(), // Tạo mã SV tạm thời bằng cụm ID
                    gpa: 3.6,
                    schedule: "Thứ 2: Ca 1 - Phòng A101" // Giả lập lịch học, sau này kết nối bảng lịch học sau
                }
            }
        });
    } catch (error) {
        console.error("Lỗi getStudentDashboard:", error);
        return res.status(500).json({ message: "Lỗi hệ thống khi lấy dữ liệu Sinh viên" });
    }
};