import { checkSchema } from "express-validator";
export default checkSchema({
    name: {
        trim: true,
        notEmpty: true,
        errorMessage: "Name is required!",
    },

    address: {
        trim: true,
        notEmpty: true,
        errorMessage: "Address is required!",
        isLength: {
            options: {
                min: 10,
                max: 255,
            },
            errorMessage:
                "Address length should be at least 10 chars and max 255 chars!",
        },
    },
});
