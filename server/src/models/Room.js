import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
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

        building: {
            type: String,
            default: ""
        },

        capacity: {
            type: Number,
            default: 0,
            min: 0
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

const Room = mongoose.model("Room", roomSchema);

export default Room;