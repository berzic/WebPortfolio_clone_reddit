import { Request, Response, Router } from "express";
import { User } from "../entities/User";
import userMiddleware from '../middlewares/user';
import authMiddleware from '../middlewares/auth';
import { isEmpty } from "class-validator";
import { AppDataSource } from "../data-source";
import Sub from "../entities/Sub";
import Post from "../entities/Post";

const createSub = async (req: Request, res: Response, next) => {
    const { name, title, description } = req.body;
     /* 현재 Sub를 생성이 가능한 User인지 체크를 위해서 User의 정보를 가져오기.
     // User의 정보가 없다면 throw error
     // User의 정보를 res.local.user에 넣어줌.
     위의 동작을 usermiddleware에서 하고 있음*/

    // User의 정보가 있다면 만들려고 하는 sub의 이름과 제목이 기존에 있는지 체크
    try {
        let errors: any = {};
        if(isEmpty(name)) errors.name = "이름을 비워둘 수 없습니다";
        if(isEmpty(title)) errors.name = "제목을 비워둘 수 없습니다";

        const sub = await AppDataSource.getRepository(Sub)
            .createQueryBuilder("sub")
            .where("lower(sub.name) = :name", { name: name.toLowerCase() })
            .getOne();

        if(sub) errors.name = "같은 이름의 커뮤니티가 이미 존재합니다."

        if(Object.keys(errors).length > 0) {
            throw errors;
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." })
    }

    try {
        const user: User = res.locals.user;
    
        // Sub Instance 생성 후 DB에 저장
        const sub = new Sub();
        sub.name = name;
        sub.description = description;
        sub.title = title;
        sub.user = user;

        await sub.save();
        // 저장한 정보를 front로 전달
        return res.json(sub);
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." })
    }
    

};

const topSubs = async (_:Request, res: Response) => {
    try {
        const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' ||s."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`;
        const subs = await AppDataSource.createQueryBuilder()
        .select(
            `s.title, s.name, ${imageUrlExp} as "imageUrl", count(p.id) as "postCount"`
          )
          .from(Sub, "s")
          .leftJoin(Post, "p", `s.name = p."subName"`)
          .groupBy('s.title, s.name, "imageUrl"')
          .orderBy(`"postCount"`, "DESC")
          .limit(5)
          .execute();
        return res.json(subs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}

const router = Router();

router.post("/", userMiddleware, authMiddleware, createSub);
router.get("/sub/topSubs", topSubs);

export default router;