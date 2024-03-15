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

// Method to fetch all posts
export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    connect();

    // Calculate the number of posts to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a query to fetch the posts that have no parent (top-level threads) (a post that is not a comment/reply).
    const postsQuery = Post.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: "desc" })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({
            path: "author",
            model: User,
        })
        .populate({
            path: "children", // Populate the children field
            populate: {
                path: "author", // Populate the author field within children
                model: User,
                select: "_id name parentId image", // Select only _id and username fields of the author
            },
        });

    // Count the total number of top-level posts (threads) i.e., posts that are not comments.
    const totalPostsCount = await Post.countDocuments({
        parentId: { $in: [null, undefined] },
    }); // Get the total count of posts

    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
}