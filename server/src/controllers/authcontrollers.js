import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m"; 
const REFRESH_TOKEN_TTL = 14*24*60 *60 *1000;

export const signup = async (req, res) => {
    
    try{
        const { username, email, password, firstName, lastName } = req.body;
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
        }
        const duplicate = await User.findOne({ email });
        if (duplicate) {
            return res.status(409).json({ message: "Email đã tồn tại" });
        }
         const hashedPassword = await bcrypt.hash(password, 10);

         await User.create({
            username,
            hashedPassword,
            email,
           
            DisplayName: `${firstName} ${lastName}`
            
         });

         return res.sendStatus(204);

    }
        catch (error) {
            console.error("lỗi khi gọi signUp", error);
            return res.status(500).json({ message: "Có lỗi xảy ra khi đăng ký" });
        }

}
 export const signIn = async (req, res) => {
    try{
        const {username, password} = req.body;
        if(!username || !password){
            return res
            .status(400)
            .json({message: "Vui lòng điền đầy đủ thông tin"});
        };
        const user = await User.findOne({username});
        if(!user){
            return res
            .status(401)
            .json({message: "Tên đăng nhập hoặc mật khẩu không đúng"});
        };
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
        if(!passwordCorrect){
            return res
            .status(401)
            .json({message: "Tên đăng nhập hoặc mật khẩu không đúng"});
        };
        const accessToken = jwt.sign(
            {userId: user._id}, 
            process.env.ACCESS_TOKEN_SECRET, 
            {expiresIn: ACCESS_TOKEN_TTL});

        
         const refreshToken = crypto.randomBytes(64).toString("hex");


          await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL,
        });

        return res.status(200).json({message: `user ${user.DisplayName} đã đăng nhập thành công`, accessToken});









        } // khong duoc viet ngoai nay 

       
    catch (error) {
        console.error("lỗi khi gọi signIn", error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi đăng nhập" });
    }
 }

 export const signOut = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;
        if(!token){
             // Xóa refesh token tu cookie 
        await Session.deleteOne({ refreshToken: token });
        }
        // Xóa cookie refresh token
        res.clearCookie("refreshToken") 
        return res.sendStatus(204);
    

       

        
        
    }
    catch (error) {
        console.error("lỗi khi gọi signOut", error);
        return res.status(500).json({ message: "Có lỗi xảy ra khi đăng xuất" });
    }

 };
