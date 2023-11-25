import { checkSchema } from "express-validator";
export default checkSchema({
    fullName: {
        errorMessage: "Full name is required!",
        notEmpty: true,
    },

    email: {
        errorMessage: "Email is required!",
        isEmail: {
            errorMessage: "Email should be valid email!",
        },
        notEmpty: true,
    },

    password: {
        errorMessage: "Password is required!",
        notEmpty: true,
    },

    confirmPassword: {
        errorMessage: "Confirm password is required!",
        notEmpty: true,
    },
});
