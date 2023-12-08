import { User } from "../entity";
import { Tenant } from "../types";
import TenantDto from "./TenantDto";

export default class UserDto {
    id: number;
    fullName: string;
    email: string;
    role: string;
    tenant: Tenant | null;

    constructor(user: User) {
        this.id = user.id;
        this.fullName = user.fullName;
        this.email = user.email;
        this.role = user.role;
        this.tenant = user.tenant ? new TenantDto(user.tenant) : null;
    }
}
