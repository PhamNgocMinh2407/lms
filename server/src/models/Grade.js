import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
    {
        enrollmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enrollment",
            required: true,
            unique: true
        },

        attendance: {
            type: Number,
            default: 0,
            min: 0,
            max: 10
        },

        assignment: {
            type: Number,
            default: 0,
            min: 0,
            max: 10
        },

        midterm: {
            type: Number,
            default: 0,
            min: 0,
            max: 10
        },

        finalExam: {
            type: Number,
            default: 0,
            min: 0,
            max: 10
        },

        total: {
            type: Number,
            default: 0
        },

        letterGrade: {
            type: String,
            default: ""
        },

        note: {
            type: String,
            default: ""
        },

        isPublished: {
            type: Boolean,
            default: false
        },

        isLocked: {
            type: Boolean,
            default: false
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

const Grade = mongoose.model("Grade", gradeSchema);

export default Grade;