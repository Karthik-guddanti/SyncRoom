import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Meeting } from "../models/meeting.model.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(httpStatus.BAD_REQUEST);
            throw new Error("Please provide username and password");
        }

        const user = await User.findOne({ username });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(httpStatus.UNAUTHORIZED);
            throw new Error("Invalid username or password");
        }
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const { name, username, password } = req.body;

        if (!name || !username || !password) {
            res.status(httpStatus.BAD_REQUEST);
            throw new Error("Please add all fields");
        }

        const userExists = await User.findOne({ username });

        if (userExists) {
            res.status(httpStatus.BAD_REQUEST);
            throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            username,
            password: hashedPassword,
        });

        if (user) {
            res.status(httpStatus.CREATED).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(httpStatus.BAD_REQUEST);
            throw new Error("Invalid user data");
        }
    } catch (error) {
        next(error);
    }
};

const getUserHistory = async (req, res, next) => {
    try {
        const meetings = await Meeting.find({ user_id: req.user.username });
        res.json(meetings);
    } catch (error) {
        next(error);
    }
};

const addToHistory = async (req, res, next) => {
    try {
        const { meeting_code } = req.body;

        if (!meeting_code) {
            res.status(httpStatus.BAD_REQUEST);
            throw new Error("Meeting code is required");
        }

        const newMeeting = new Meeting({
            user_id: req.user.username,
            meetingCode: meeting_code,
        });

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (error) {
        next(error);
    }
};

export { login, register, getUserHistory, addToHistory };