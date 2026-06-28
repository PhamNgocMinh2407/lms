import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        majorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Major",
            required: true
        },

        code: {
            type: String,
            required: true,
            unique: true,
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

        isActive: {
            type: Boolean,
            default: true
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

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;