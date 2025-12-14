import { z } from "zod"
import { emailSchema, passwordSchema } from "./generalSchemas"

export const signInSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})