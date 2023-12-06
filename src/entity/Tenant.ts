import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity({ name: "users" })
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { length: 100 })
    name: string;

    @Column("varchar", { length: 255 })
    address: string;

    @Column()
    rating: number;

    @UpdateDateColumn()
    updatedAt: number;

    @CreateDateColumn()
    createdAt: number;
}
