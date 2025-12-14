import { z } from 'zod'

export const usernameSchema = z
    .string()
    .trim()
    .max(20, "Username cannot be greater than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters")

export const emailSchema = z
    .string()
    .email("Please enter a valid email")

export const passwordSchema = z
    .string()
    .min(8, "Password should be atleast of 8 characters")

export const titleSchema = z
    .string()
    .min(10, "Title should be atleast of 10 characters")
    .max(200, "Title cannot be greater than 200 characters")

export const descriptionSchema = z
    .string()
    .min(50, "Description should be atleast of 50 characters")
    .max(3000, "Description cannot be greater than 3000 characters")