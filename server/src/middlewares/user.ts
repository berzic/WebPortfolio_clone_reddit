import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User";

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 현재 Sub를 생성이 가능한 User인지 체크를 위해서 User의 정보를 가져오기.
        const token = req.cookies.token;
        // console.log("totken", token);
        if(!token) return next();
        // verify 메소드의 jwt secret을 아용해서 token decode
        const {username}: any = jwt.verify(token, process.env.JWT_secret);
        const user = await User.findOneBy({ username });
        // console.log("user", user);

        // User의 정보가 없다면 throw error
        if(!user) throw new Error("Unauthenticated");

        // User의 정보를 res.local.user에 넣어줌.
        res.locals.user = user;
        return next();

    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "SomeThing went wrong" });
        
    }
};