import mongoose from "mongoose";

import SubjectProposal from "../models/SubjectProposal.js";
import Subject from "../models/Subject.js";

const populateSubjectProposal = (query) => {
    return query
        .populate("createdBy", "username displayName DisplayName email role")
        .populate("tbmReviewedBy", "username displayName DisplayName email role")
        .populate("htReviewedBy", "username displayName DisplayName email role")
        .populate("publishedBy", "username displayName DisplayName email role")
        .populate("publishedSubjectId", "code name credits");
};

export const createSubjectProposal = async (req, res) => {
    try {
        const { code, name, credits, description, reason } = req.body || {};

        if (!code || !name || !credits || !reason) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ mã môn, tên môn, số tín chỉ và lý do đề xuất"
            });
        }

        const existedSubject = await Subject.findOne({
            code: code.toUpperCase(),
            isDeleted: false
        });

        if (existedSubject) {
            return res.status(409).json({
                success: false,
                message: "Mã môn học đã tồn tại"
            });
        }

        const existedProposal = await SubjectProposal.findOne({
            code: code.toUpperCase(),
            isDeleted: false,
            status: {
                $in: ["pending_tbm", "pending_ht", "approved_for_pdt"]
            }
        });

        if (existedProposal) {
            return res.status(409).json({
                success: false,
                message: "Môn học này đang có đề xuất chờ xử lý"
            });
        }

        const proposal = await SubjectProposal.create({
            code,
            name,
            credits,
            description,
            reason,
            createdBy: req.user.id || req.user._id
        });

        const populatedProposal = await populateSubjectProposal(
            SubjectProposal.findById(proposal._id)
        );

        return res.status(201).json({
            success: true,
            message: "Tạo đề xuất môn học thành công",
            data: populatedProposal
        });

    } catch (error) {
        console.error("createSubjectProposal:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getMySubjectProposals = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const proposals = await populateSubjectProposal(
            SubjectProposal.find({
                createdBy: userId,
                isDeleted: false
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất của tôi thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getMySubjectProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getPendingTbmProposals = async (req, res) => {
    try {
        const proposals = await populateSubjectProposal(
            SubjectProposal.find({
                status: "pending_tbm",
                isDeleted: false
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất chờ trưởng bộ môn duyệt thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getPendingTbmProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const tbmApproveSubjectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đề xuất không hợp lệ"
            });
        }

        const proposal = await SubjectProposal.findOne({
            _id: id,
            isDeleted: false
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đề xuất môn học"
            });
        }

        if (proposal.status !== "pending_tbm") {
            return res.status(400).json({
                success: false,
                message: "Đề xuất không ở trạng thái chờ trưởng bộ môn duyệt"
            });
        }

        proposal.status = "pending_ht";
        proposal.tbmReviewedBy = req.user.id || req.user._id;
        proposal.tbmReviewedAt = new Date();
        proposal.tbmNote = note || "";

        await proposal.save();

        return res.status(200).json({
            success: true,
            message: "Trưởng bộ môn đã duyệt đề xuất, chuyển lên hiệu trưởng",
            data: proposal
        });

    } catch (error) {
        console.error("tbmApproveSubjectProposal:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const tbmRejectSubjectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đề xuất không hợp lệ"
            });
        }

        const proposal = await SubjectProposal.findOne({
            _id: id,
            isDeleted: false
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đề xuất môn học"
            });
        }

        if (proposal.status !== "pending_tbm") {
            return res.status(400).json({
                success: false,
                message: "Đề xuất không ở trạng thái chờ trưởng bộ môn duyệt"
            });
        }

        proposal.status = "tbm_rejected";
        proposal.tbmReviewedBy = req.user.id || req.user._id;
        proposal.tbmReviewedAt = new Date();
        proposal.tbmNote = note || "";

        await proposal.save();

        return res.status(200).json({
            success: true,
            message: "Trưởng bộ môn đã từ chối đề xuất",
            data: proposal
        });

    } catch (error) {
        console.error("tbmRejectSubjectProposal:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};
export const getPendingHtProposals = async (req, res) => {
    try {
        const proposals = await populateSubjectProposal(
            SubjectProposal.find({
                status: "pending_ht",
                isDeleted: false
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất chờ hiệu trưởng duyệt thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getPendingHtProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const htApproveSubjectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đề xuất không hợp lệ"
            });
        }

        const proposal = await SubjectProposal.findOne({
            _id: id,
            isDeleted: false
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đề xuất môn học"
            });
        }

        if (proposal.status !== "pending_ht") {
            return res.status(400).json({
                success: false,
                message: "Đề xuất không ở trạng thái chờ hiệu trưởng duyệt"
            });
        }

        proposal.status = "approved_for_pdt";
        proposal.htReviewedBy = req.user.id || req.user._id;
        proposal.htReviewedAt = new Date();
        proposal.htNote = note || "";

        await proposal.save();

        return res.status(200).json({
            success: true,
            message: "Hiệu trưởng đã duyệt đề xuất, chuyển cho phòng đào tạo công bố",
            data: proposal
        });

    } catch (error) {
        console.error("htApproveSubjectProposal:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const htRejectSubjectProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đề xuất không hợp lệ"
            });
        }

        const proposal = await SubjectProposal.findOne({
            _id: id,
            isDeleted: false
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đề xuất môn học"
            });
        }

        if (proposal.status !== "pending_ht") {
            return res.status(400).json({
                success: false,
                message: "Đề xuất không ở trạng thái chờ hiệu trưởng duyệt"
            });
        }

        proposal.status = "ht_rejected";
        proposal.htReviewedBy = req.user.id || req.user._id;
        proposal.htReviewedAt = new Date();
        proposal.htNote = note || "";

        await proposal.save();

        return res.status(200).json({
            success: true,
            message: "Hiệu trưởng đã từ chối đề xuất",
            data: proposal
        });

    } catch (error) {
        console.error("htRejectSubjectProposal:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const getApprovedForPdtProposals = async (req, res) => {
    try {
        const proposals = await populateSubjectProposal(
            SubjectProposal.find({
                status: "approved_for_pdt",
                isDeleted: false
            }).sort({ createdAt: -1 })
        );

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách đề xuất chờ phòng đào tạo công bố thành công",
            count: proposals.length,
            data: proposals
        });

    } catch (error) {
        console.error("getApprovedForPdtProposals:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};

export const publishSubjectProposal = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "ID đề xuất không hợp lệ"
            });
        }

        const proposal = await SubjectProposal.findOne({
            _id: id,
            isDeleted: false
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy đề xuất môn học"
            });
        }

        if (proposal.status !== "approved_for_pdt") {
            return res.status(400).json({
                success: false,
                message: "Đề xuất chưa được hiệu trưởng duyệt để công bố"
            });
        }

        const existedSubject = await Subject.findOne({
            code: proposal.code,
            isDeleted: false
        });

        if (existedSubject) {
            return res.status(409).json({
                success: false,
                message: "Mã môn học đã tồn tại, không thể công bố"
            });
        }

        const subject = await Subject.create({
            code: proposal.code,
            name: proposal.name,
            credits: proposal.credits,
            description: proposal.description
        });

        proposal.status = "published";
        proposal.publishedBy = req.user.id || req.user._id;
        proposal.publishedAt = new Date();
        proposal.publishedSubjectId = subject._id;

        await proposal.save();

        const populatedProposal = await populateSubjectProposal(
            SubjectProposal.findById(proposal._id)
        );

        return res.status(200).json({
            success: true,
            message: "Công bố môn học thành công",
            data: {
                proposal: populatedProposal,
                subject
            }
        });

    } catch (error) {
        console.error("publishSubjectProposal:", error);

        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống"
        });
    }
};