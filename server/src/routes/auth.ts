import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';

const mapErrors = (errors: Object[]) => {
    return errors.reduce((prev: any, err: any) => {
        prev[err.property] = Object.entries(err.consraints)[0][1]

        return prev;
    },{})
}

const me = async (_: Request, res: Response) => {
    return res.json(res.locals.user);
}

const register = async (req: Request , res: Response) => {
    const { email, username, password } = req.body;
    //console.log(email, username, password);
    try {
        let errors: any = {};

        //email, username이 이미 기존에 DB에 등록/저장이 되어 사용되고 있는지 확인.
        const emailUser = await User.findOneBy({ email });
        const usernameUser = await User.findOneBy({ username });

        //이미 등록되어 사용중이라면 error객체에 넣어줌
        if(emailUser) errors.email = "이미 사용중인 email입니다."
        if(usernameUser) errors.username = "이미 사용중인 이름입니다."

        //error가 있다면 return으로 error를 response
        if(Object.keys(errors).length > 0) {
            return res.status(400).json(errors)
        }

        //아무도 사용중이지 않다면 등록/저장
        const user = new User();
        user.email = email;
        user.username = username;
        user.password = password;

        //UserEntity에서 정한 DataType , Length를 확인하는 유효성 검사.
        errors = await validate(user);
        
        if(errors.length>0) return res.status(400).json(mapErrors(errors));

        //User의 정보를 User Table에 저장
        await user.save();
        return res.json(user);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
    }
};

const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
      let errors: any = {};
      // 입력받은 데이터가 빈칸이라면  error를 fromt로 보내주기
      if (isEmpty(username))
        errors.username = "사용자 이름을 입력해주세여.";
      if (isEmpty(password)) errors.password = "비밀번호를 입력해주세요.";
      if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
      }
  
      // DB에서 입력받은 값과 일치하는 User찾기
      const user = await User.findOneBy({ username });
  
      if (!user)
        return res
          .status(404)
          .json({ username: "등록되지 않은 사용자 입니다." });
  
      // 등록된 유저가 있다면 bycrip한 비밀번호를 비교
      const passwordMatches = await bcrypt.compare(password, user.password);
  
      // 비밀번호가 다르면 error
      if (!passwordMatches) {
        return res.status(401).json({ password: "비밀번호가 잘못되었습니다." });
      }
  
      // 비밀번호가 맞다면 token 생성
      const token = jwt.sign({ username }, process.env.JWT_SECRET);
  
      // 쿠키에 저장
      res.set("Set-Cookie", cookie.serialize("token", token, {
        httpOnly: true,
        maxAge: 60* 60* 24 * 7,//1주일
        path: "/"
      }));
  
      return res.json({ user, token });
    } catch (error) {
      console.error(error);
      return res.status(500).json(error);
    }
    };

const logout = async (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );
  res.status(200).json({ success: true });
};


const router = Router();
router.get("/me", userMiddleware, authMiddleware, me);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", userMiddleware, authMiddleware, logout);

export default router;