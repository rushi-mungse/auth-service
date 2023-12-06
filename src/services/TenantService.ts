import { Repository } from "typeorm";
import { Tenant } from "../entity";
import { TenantData } from "../types";

export default class TenantService {
    constructor(private tenantRepository: Repository<Tenant>) {}
    async create(tenantData: TenantData) {
        return await this.tenantRepository.save(tenantData);
    }
}
