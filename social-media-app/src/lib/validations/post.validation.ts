import * as z from "zod";

// Min 3 chars
export const PostValidation = z.object({
    post: z.string().min(3, { message: "Minimum 3 characters." }),
    accountId: z.string(),
});

// Min 3 chars
export const CommentValidation = z.object({
    post: z.string().min(3, { message: "Minimum 3 characters." }),
});
