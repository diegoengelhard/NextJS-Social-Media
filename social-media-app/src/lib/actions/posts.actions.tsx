"use server";

import { revalidatePath } from "next/cache";
import { connect } from '@/config/mongoose';
import Post from '@/lib/models/Post.model';
import User from '@/lib/models/User.model';

// Define post params when creating a new post
interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

// Method to create a new post
export async function createPost({ text, author, communityId, path }: Params) {
    try {
        connect();

        // Create post object
        const post = new Post({
            text,
            author,
            community: null,
        });

        // Save post
        await post.save();

        // Update user who created the post
        await User.findOneAndUpdate(
            { id: author },
            { $push: { posts: post._id } },
            { upsert: true }
        );

        // Revalidate the path
        revalidatePath(path);

        console.log('Post created successfully: ', post);
    } catch (error: any) {
        console.log('Error creating post: ', error);
        throw new Error(`Failed to create thread: ${error.message}`);
    }
}