// Đổi thành export const ở đầu hàm để file userroutes.js có thể import { authorize } được
export const authorize = (...roles) => {
    return (req, res, next) => {
        // Kiểm tra người dùng đã đăng nhập chưa
        if (!req.user) {
            return res.status(401).json({
                message: 'Chưa đăng nhập'
            });
        }

        // Kiểm tra role có được phép không
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Bạn không có quyền thực hiện hành động này'
            });
        }

        next();
    };
};