import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./libs/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userroutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import majorRoutes from "./routes/majorRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import academicYearRoutes from "./routes/academicYearRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import courseSectionRoutes from "./routes/courseSectionRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import transcriptRoutes from "./routes/transcriptRoutes.js";
import subjectProposalRoutes from "./routes/subjectProposalRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import tbmRoutes from "./routes/tbmRoutes.js";
import htRoutes from "./routes/htRoutes.js";
import pdtRoutes from "./routes/pdtRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";


dotenv.config();

console.log("--- KIỂM TRA CHUỖI KẾT NỐI ---");
console.log("Giá trị đọc được:", process.env.MONGODB_CONNECTION_STRING);
console.log("-------------------------------");


const app = express();


const PORT = process.env.PORT || 5001;



app.use(express.json());


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,              
    methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser());



//public routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hr", hrRoutes); 
app.use("/api/faculties", facultyRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/majors", majorRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/course-sections", courseSectionRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/subject-proposals", subjectProposalRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/tbms", tbmRoutes);
app.use("/api/pdts", pdtRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/hts", htRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/admins", adminDashboardRoutes);

// private routes

connectDB().then (() => {
    app.listen(PORT, () => {
  console.log(`Server bắt đầu trên cổng ${PORT}`);
});
})
