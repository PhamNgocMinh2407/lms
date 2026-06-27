import User from "../models/User.js";

const STAFF_ROLES = ["hr", "teacher", "tbm", "pdt"];

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
        const staffRoles = ["hr", "teacher", "tbm", "pdt"];

        const totalStaffs = await User.countDocuments({
            role: { $in: staffRoles },
            isDeleted: false
        });

        const activeStaffs = await User.countDocuments({
            role: { $in: staffRoles },
            isDeleted: false,
            isActive: true
        });

        const lockedStaffs = await User.countDocuments({
            role: { $in: staffRoles },
            isDeleted: false,
            isActive: false
        });

        const hrCount = await User.countDocuments({ role: "hr", isDeleted: false });
        const teacherCount = await User.countDocuments({ role: "teacher", isDeleted: false });
        const tbmCount = await User.countDocuments({ role: "tbm", isDeleted: false });
        const pdtCount = await User.countDocuments({ role: "pdt", isDeleted: false });

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
                    pdt: pdtCount
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