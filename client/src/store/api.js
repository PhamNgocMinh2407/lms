
const BASE_URL = "http://localhost:5001/api"; 

export const loginUser = async (username, password) => {
    // Gọi chính xác đến : {{base_url}}/auth/signin
    const response = await fetch(`${BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        
        credentials: "include", 
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        // Trả về thông báo lỗi từ backend (Ví dụ: "Tên đăng nhập hoặc mật khẩu không đúng")
        throw new Error(data.message || "Đăng nhập thất bại");
    }

    return data; // Trả về { message, accessToken }
};