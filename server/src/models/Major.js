import mongoose from "mongoose";

const majorSchema = new mongoose.Schema(
    {
        facultyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Faculty",
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

const Major = mongoose.model("Major", majorSchema);

export default Major;