import mongoose from "mongoose";

export const connectDB = async () => {
 try{
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("liên kết với cơ sở dữ liệu thành công ");
 } catch (error) {
    console.error("Lỗi khi kết nối với cơ sở dữ liệu:", error);
    process.exit(1);
 }
}