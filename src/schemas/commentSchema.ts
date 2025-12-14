import { z } from "zod"

export const commentSchema = z
    .string()
    .min(1, "Comment should be atleast of 1 character")
    .max(500, "Description cannot be greater than 500 characters")