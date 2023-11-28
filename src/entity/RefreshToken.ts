import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "refreshTokens" })
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @Column({ type: "timestamp" })
    expiresAt: Date;

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
