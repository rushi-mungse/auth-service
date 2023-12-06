import { Tenant } from "../entity";

export default class TenantDto {
    id: number;
    name: string;
    address: string;
    rating: number;

    constructor(tenant: Tenant) {
        this.id = tenant.id;
        this.name = tenant.name;
        this.address = tenant.address;
        this.rating = tenant.rating;
    }
}
