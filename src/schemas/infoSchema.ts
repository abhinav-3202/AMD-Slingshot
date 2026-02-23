import * as z from "zod";

export const infoSchema = z.object({
    name : z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must be at most 20 characters long"),
    age: z.preprocess(
        (val) => val === "" ? undefined : Number(val),
        z.number().min(0, "Age must be at least 0").optional()
    ),
    weight: z.preprocess(
        (val) => val === "" ? undefined : Number(val),
        z.number().max(500, "Weight must be at most 500").optional()
    ),
    gender: z.enum(["male", "female", "others"])
}) 