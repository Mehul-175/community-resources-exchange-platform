import { z } from 'zod';

export const signupSchema = z.object({
    firstname: z.string().min(1, "first name is required"),
    lastname: z.string().min(1, " lastname is required"),
    username: z.string().min(3).toLowerCase(),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be atleast 8 characters"),
    profilePic: z.string().optional(),
    bio: z.string().optional()
})

export type signupInput = z.infer<typeof signupSchema>;


