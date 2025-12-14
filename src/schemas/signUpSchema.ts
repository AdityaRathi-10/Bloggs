import { z } from "zod"
import { emailSchema, passwordSchema, usernameSchema } from "./generalSchemas"

export const signUpSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    profileImage: z.string().optional()
})