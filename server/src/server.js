import express from "express";
import dotenv from "dotenv";
import {connectDB} from "./libs/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userroutes.js";
import cookieParser from "cookie-parser";


dotenv.config();

console.log("--- KIỂM TRA CHUỖI KẾT NỐI ---");
console.log("Giá trị đọc được:", process.env.MONGODB_CONNECTION_STRING);
console.log("-------------------------------");


const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cookieParser());



//public routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// private routes

connectDB().then (() => {
    app.listen(PORT, () => {
  console.log(`Server bắt đầu trên cổng ${PORT}`);
});
})
