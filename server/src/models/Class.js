import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
    {
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

        cohort: {
            type: String,
            trim: true
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

const ClassModel = mongoose.model("Class", classSchema);

export default ClassModel;