import { User } from "../entity";

export default class UserDto {
    id: number;
    fullName: string;
    email: string;
    role: string;

    constructor(user: User) {
        this.id = user.id;
        this.fullName = user.fullName;
        this.email = user.email;
        this.role = user.role;
    }
}
