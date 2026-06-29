import mongoose from "mongoose";

const subjectProposalSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        credits: {
            type: Number,
            required: true,
            min: 1
        },

        description: {
            type: String,
            default: ""
        },

        reason: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "pending_tbm",
                "tbm_rejected",
                "pending_ht",
                "ht_rejected",
                "approved_for_pdt",
                "published"
            ],
            default: "pending_tbm"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        tbmReviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        tbmReviewedAt: {
            type: Date
        },

        tbmNote: {
            type: String,
            default: ""
        },

        htReviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        htReviewedAt: {
            type: Date
        },

        htNote: {
            type: String,
            default: ""
        },

        publishedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        publishedAt: {
            type: Date
        },

        publishedSubjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const SubjectProposal = mongoose.model(
    "SubjectProposal",
    subjectProposalSchema
);

export default SubjectProposal;