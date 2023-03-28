import "reflect-metadata"
import { DataSource } from "typeorm"
import Comment from "./entities/Comment"
import Post from "./entities/Post"
import Sub from "./entities/Sub"
import { User } from "./entities/User"
import Vote from "./entities/Vote"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    synchronize: true,
    logging: false,
    // entities: ["src/entities/**/*.ts"],
    //위의 방식이 적용되지 않아서 임시로 하드코딩
    entities: [User, Post, Sub, Comment, Vote],
    migrations: [],
    subscribers: [],
})