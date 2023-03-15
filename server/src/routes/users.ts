import { Request, Response, Router } from "express";
import Comment from "../entities/Comment";
import Post from "../entities/Post";
import { User } from "../entities/User";
import userMiddleware from "../middlewares/user";

const getUserData = async(req: Request, res: Response) => {
    try {
        // 유저 정보 가져오기
        const user = await User.findOneOrFail({
          where: { username: req.params.username },
          select: ["username", "createdAt"],
        });
    
        // 유저가 쓴 포스트 정보 가져오기
        // relations 에서 comments와 votes를 가져오는 이유는
        // Post Entity에서 Expose한 CommentCount와 VoteScore를 가져오기 위해서
        const posts = await Post.find({
          where: { username: user.username },
          relations: ["comments", "votes", "sub"],
        });
    
        // 유저가 쓴 댓글 정보 가져오기
        const comments = await Comment.find({
          where: { username: user.username },
          relations: ["post"],
        });
    
        if (res.locals.user) {
          const { user } = res.locals;
          posts.forEach((p) => p.setUserVote(user));
          comments.forEach((c) => c.setUserVote(user));
        }
        // 모든 데이터를 배열에 넣어줌
        let userData: any[] = [];
    
        // Expose를 이용한 getter는 class형식(인스턴스 상태)을 하고 있기 때문에 그냥 가져오지 못한다.
        // toJSON으로 객체로 바꾼 후 복사해서 넣어준다.
        posts.forEach((p) => userData.push({ type: "Post", ...p.toJSON() }));
        comments.forEach((c) => userData.push({ type: "Comment", ...c.toJSON() }));
    
        // 최신 정보가 먼저 오게 순서 정렬
        userData.sort((a, b) => {
          if (b.createdAt > a.createdAt) return 1;
          if (b.createdAt < a.createdAt) return -1;
          return 0;
        });
    
        return res.json({ user, userData });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
      }
}

const router = Router();
router.get("/:username", userMiddleware, getUserData);

export default router;