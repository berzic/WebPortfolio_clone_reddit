import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";

export default abstract class Entity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createAt: Date;

    @CreateDateColumn()
    updateAt: Date;

}