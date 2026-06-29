import SubjectProposal from "../models/SubjectProposal.js";

export const getTbmDashboard = async (req, res) => {
    try {
        const tbmId = req.user.id || req.user._id;

        const [
            pendingProposals,
            approvedByMe,
            rejectedByMe,
            sentToHt
        ] = await Promise.all([
            SubjectProposal.countDocuments({
                status: "pending_tbm",
                isDeleted: false
            }),

            SubjectProposal.countDocuments({
                tbmReviewedBy: tbmId,
                status: {
                    $in: ["pending_ht", "approved_for_pdt", "published"]
                },
                isDeleted: false
            }),

            SubjectProposal.countDocuments({
                tbmReviewedBy: tbmId,
                status: "tbm_rejected",
                isDeleted: false
            }),

            SubjectProposal.countDocuments({
                status: "pending_ht",
                isDeleted: false
            })
        ]);

        return res.status(200).json({
            success: true,
            message: "Lấy dashboard trưởng bộ môn thành công",
            data: {
                pendingProposals,
                approvedByMe,
                rejectedByMe,
                sentToHt
            }
        });

    } catch (error) {
        console.error("getTbmDashboard:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getTbmPendingProposals = async (req, res) => {
    try {
        const proposals = await SubjectProposal.find({
            status: "pending_tbm",
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất chờ trưởng bộ môn duyệt thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getTbmPendingProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getTbmReviewedProposals = async (req, res) => {
    try {
        const tbmId = req.user.id || req.user._id;

        const proposals = await SubjectProposal.find({
            tbmReviewedBy: tbmId,
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .populate("htReviewedBy", "username displayName DisplayName email role")
            .populate("publishedBy", "username displayName DisplayName email role")
            .populate("publishedSubjectId", "code name credits")
            .sort({ tbmReviewedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất trưởng bộ môn đã xử lý thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getTbmReviewedProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getTbmSentToHtProposals = async (req, res) => {
    try {
        const tbmId = req.user.id || req.user._id;

        const proposals = await SubjectProposal.find({
            tbmReviewedBy: tbmId,
            status: {
                $in: [
                    "pending_ht",
                    "ht_rejected",
                    "approved_for_pdt",
                    "published"
                ]
            },
            isDeleted: false
        })
            .populate("createdBy", "username displayName DisplayName email role")
            .populate("htReviewedBy", "username displayName DisplayName email role")
            .populate("publishedBy", "username displayName DisplayName email role")
            .populate("publishedSubjectId", "code name credits")
            .sort({ tbmReviewedAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất đã chuyển lên hiệu trưởng thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getTbmSentToHtProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};