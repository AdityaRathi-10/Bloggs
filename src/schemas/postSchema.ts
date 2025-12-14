import { z } from "zod"
import { descriptionSchema, titleSchema } from "./generalSchemas"

export const postSchmea = z.object({
    title: titleSchema,
    description: descriptionSchema,
    image: z.string()
})