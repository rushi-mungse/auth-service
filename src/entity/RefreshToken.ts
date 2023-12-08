import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./";

@Entity({ name: "refreshTokens" })
export default class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, {
        nullable: true,
        cascade: ["update", "remove"],
        onDelete: "SET NULL",
    })
    user: User;

    @Column({ type: "timestamp" })
    expiresAt: Date;

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
