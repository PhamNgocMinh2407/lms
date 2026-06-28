import mongoose from "mongoose";

const courseSectionSchema = new mongoose.Schema(
    {
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Semester",
            required: true
        },

        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
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

        maxStudents: {
            type: Number,
            default: 40,
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

const CourseSection = mongoose.model("CourseSection", courseSectionSchema);

export default CourseSection;