import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
    {
        academicYearId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AcademicYear",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
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

const Semester = mongoose.model("Semester", semesterSchema);

export default Semester;