import { checkSchema } from "express-validator";
export default checkSchema({
    fullName: {
        trim: true,
        notEmpty: true,
        errorMessage: "Full name is required!",
    },

    tenantId: {
        trim: true,
        notEmpty: true,
        errorMessage: "TenantId is required!",
    },

    role: {
        trim: true,
        notEmpty: true,
        errorMessage: "Role is required!",
    },
});
