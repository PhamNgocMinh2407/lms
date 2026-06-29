import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        courseSectionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseSection",
            required: true
        },

        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        enrollmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enrollment",
            required: true
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        attendanceDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["present", "absent", "late", "excused"],
            default: "present"
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

attendanceSchema.index(
    {
        courseSectionId: 1,
        studentId: 1,
        attendanceDate: 1
    },
    {
        unique: true
    }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;