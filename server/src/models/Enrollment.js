import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        courseSectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseSection",
            required: true
        },

        status: {
            type: String,
            enum: ["enrolled", "cancelled", "completed"],
            default: "enrolled"
        },

        enrolledAt: {
            type: Date,
            default: Date.now
        },

        note: {
            type: String,
            default: ""
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

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;