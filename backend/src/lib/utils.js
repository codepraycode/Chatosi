import jwt from "jsonwebtoken"
import { isProd } from "../config/env.js";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d", // 7 days
    });

    res.cookie("jwt", token, {
        httpOnly: true,           // can't be read by JS
        secure: isProd,           // only over HTTPS in prod
        sameSite: isProd ? "none" : "lax", // cross-site in prod, lax in dev
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });
};