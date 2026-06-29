const expandRoles = (roles) => {
    const expandedRoles = new Set(roles);

    if (expandedRoles.has("admin") || expandedRoles.has("ht")) {
        expandedRoles.add("admin");
        expandedRoles.add("ht");
    }

    return Array.from(expandedRoles);
};


export const authorize = (...roles) => {
    return (req, res, next) => {
      
        if (!req.user) {
            return res.status(401).json({
                message: "Chưa đăng nhập"
            });
        }

        const allowedRoles = expandRoles(roles);

        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Bạn không có quyền thực hiện hành động này"
            });
        }

        next();
    };
};