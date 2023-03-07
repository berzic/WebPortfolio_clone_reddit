import { IsEmail, Length } from "class-validator";
import { Entity, Column, Index, OneToMany, BeforeInsert } from "typeorm"
import BaseEntity from './Entity';
import bycript from 'bcryptjs';
import Post from "./Post";
import Vote from "./Vote";

@Entity("users")
export class User extends BaseEntity{
    @Index()
    @IsEmail(undefined, { message: "이메일 주소가 잘못되었습니다." })
    @Length(2,255, {message: "이메일 주소는 빈칸으로 둘 수 없습니다."})
    @Column({ unique: true })
    email: string;

    @Index()
    @Length(2,32, { message: "사용자 이름은 성을 포함하여 2글자 이상 적어주세요"})
    @Column({ unique: true })
    username: string;

    @Column()
    @Length(6,255, { message: "비밀번호는 6자리 이상으로 적어주세요."})
    password: string;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Vote, (vote) =>vote.user)
    votes: Vote[];

    @BeforeInsert()
    async hashPassword() {
        this.password = await bycript.hash(this.password, 6);
    }
}