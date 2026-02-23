import * as z from "zod";

export const infoSchema = z.object({
    name : z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must be at most 20 characters long"),
    age : z.number().min(0, "Age must be at least 0"),
    weight : z.number().max(160, "Weight must be at most 160"),
    gender: z.enum(["male", "female", "others"])
})