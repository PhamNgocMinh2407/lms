import mongoose from "mongoose";
import Room from "../models/Room.js";

export const getAllRooms = async (req, res) => {
    try {
        const { keyword } = req.query;

        const filter = { isDeleted: false };

        if (keyword) {
            filter.$or = [
                { code: { $regex: keyword, $options: "i" } },
                { name: { $regex: keyword, $options: "i" } },
                { building: { $regex: keyword, $options: "i" } }
            ];
        }

        const rooms = await Room.find(filter)
            .select("-__v")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Lấy danh sách phòng học thành công",
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        console.error("getAllRooms:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID phòng học không hợp lệ" });
        }

        const room = await Room.findOne({ _id: id, isDeleted: false }).select("-__v");

        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng học" });
        }

        return res.status(200).json({
            success: true,
            message: "Lấy thông tin phòng học thành công",
            data: room
        });
    } catch (error) {
        console.error("getRoomById:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const createRoom = async (req, res) => {
    try {
        const { code, name, building, capacity, description } = req.body || {};

        if (!code || !name) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập mã phòng và tên phòng"
            });
        }

        const capacityNumber = capacity === undefined ? 0 : Number(capacity);

        if (!Number.isInteger(capacityNumber) || capacityNumber < 0) {
            return res.status(400).json({
                success: false,
                message: "Sức chứa phải là số nguyên lớn hơn hoặc bằng 0"
            });
        }

        const exists = await Room.findOne({
            code: code.trim().toUpperCase(),
            isDeleted: false
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Mã phòng đã tồn tại"
            });
        }

        const room = await Room.create({
            code,
            name,
            building,
            capacity: capacityNumber,
            description
        });

        return res.status(201).json({
            success: true,
            message: "Tạo phòng học thành công",
            data: room
        });
    } catch (error) {
        console.error("createRoom:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, building, capacity, description } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID phòng học không hợp lệ" });
        }

        const room = await Room.findOne({ _id: id, isDeleted: false });

        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng học" });
        }

        if (code && code.trim().toUpperCase() !== room.code) {
            const exists = await Room.findOne({
                code: code.trim().toUpperCase(),
                isDeleted: false,
                _id: { $ne: id }
            });

            if (exists) {
                return res.status(409).json({
                    success: false,
                    message: "Mã phòng đã tồn tại"
                });
            }

            room.code = code;
        }

        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Tên phòng không được để trống"
                });
            }

            room.name = name;
        }

        if (building !== undefined) room.building = building;

        if (capacity !== undefined) {
            const capacityNumber = Number(capacity);

            if (!Number.isInteger(capacityNumber) || capacityNumber < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Sức chứa phải là số nguyên lớn hơn hoặc bằng 0"
                });
            }

            room.capacity = capacityNumber;
        }

        if (description !== undefined) room.description = description;

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Cập nhật phòng học thành công",
            data: room
        });
    } catch (error) {
        console.error("updateRoom:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID phòng học không hợp lệ" });
        }

        const room = await Room.findOne({ _id: id, isDeleted: false });

        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng học" });
        }

        room.isDeleted = true;
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Xóa phòng học thành công"
        });
    } catch (error) {
        console.error("deleteRoom:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const lockRoom = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID phòng học không hợp lệ" });
        }

        const room = await Room.findOne({ _id: id, isDeleted: false });

        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng học" });
        }

        room.isActive = false;
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Khóa phòng học thành công"
        });
    } catch (error) {
        console.error("lockRoom:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const unlockRoom = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID phòng học không hợp lệ" });
        }

        const room = await Room.findOne({ _id: id, isDeleted: false });

        if (!room) {
            return res.status(404).json({ success: false, message: "Không tìm thấy phòng học" });
        }

        room.isActive = true;
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Mở khóa phòng học thành công"
        });
    } catch (error) {
        console.error("unlockRoom:", error);
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};