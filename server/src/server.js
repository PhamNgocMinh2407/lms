import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./libs/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userroutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import hrRoutes from "./routes/hrRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
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
    origin: "http://localhost:5173", // Cho phép Frontend Vite của bạn truy cập
    credentials: true,               // Bắt buộc để trình duyệt chịu lưu Cookie (refreshToken) giống Postman
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

// private routes

connectDB().then (() => {
    app.listen(PORT, () => {
  console.log(`Server bắt đầu trên cổng ${PORT}`);
});
})
