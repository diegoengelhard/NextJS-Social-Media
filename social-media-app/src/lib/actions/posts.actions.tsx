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

// Method to search posts by keyword
export async function searchPosts(keyword: string): Promise<any> {
    connect();

    try {
        const posts = await Post.find({ text: { $regex: keyword, $options: 'i' } })
            .sort({ createdAt: "desc" })
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

        return posts;
    } catch (error) {
        console.log("Error searching posts: ", error);
        throw new Error("Unable to search post by keyword");
    }
}

// Method to fetch post by id
export async function fetchPostById(threadId: string) {
    connect();

    try {
        const post = await Post.findById(threadId)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            }) // Populate the author field with _id and username
            // .populate({
            //     path: "community",
            //     model: Community,
            //     select: "_id id name image",
            // }) // Populate the community field with _id and name
            .populate({
                path: "children", // Populate the children field
                populate: [
                    {
                        path: "author", // Populate the author field within children
                        model: User,
                        select: "_id id name parentId image", // Select only _id and username fields of the author
                    },
                    {
                        path: "children", // Populate the children field within children
                        model: Post, // The model of the nested children (assuming it's the same "Thread" model)
                        populate: {
                            path: "author", // Populate the author field within nested children
                            model: User,
                            select: "_id id name parentId image", // Select only _id and username fields of the author
                        },
                    },
                ],
            })
            .exec();

        return post;
    } catch (err) {
        console.error("Error while fetching post:", err);
        throw new Error("Unable to fetch post");
    }
}

// Method to create a new comment
export async function addCommentToPost(threadId: string, commentText: string, userId: string, path: string) {
    connect();

    try {
        // Find the original thread by its ID
        const originalPost = await Post.findById(threadId);

        if (!originalPost) {
            throw new Error("Post not found");
        }

        // Create the new comment thread
        const commentPost = new Post({
            text: commentText,
            author: userId,
            parentId: threadId, // Set the parentId to the original thread's ID
        });

        // Save the comment thread to the database
        const savedCommentPost = await commentPost.save();

        // Add the comment thread's ID to the original thread's children array
        originalPost.children.push(savedCommentPost._id);

        // Save the updated original thread to the database
        await originalPost.save();

        revalidatePath(path);
    } catch (err) {
        console.log("Error while adding comment:", err);
        throw new Error("Unable to add comment");
    }
}

// Methid to update post (only update text field)
export async function updatePost(postId: string, newText: string, path: string) {
    connect();

    try {
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { text: newText },
            { new: true }
        );

        revalidatePath(path);

        return updatedPost;

    } catch (err) {
        console.error("Error while updating post:", err);
        throw new Error("Unable to update post");
    }
}

// Method to toggle like on post
export async function toggleLikeOnPost(postId: string, userId: string, path: string) {
    connect();

    try {
        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, post, { new: true });

        revalidatePath(path);

        return updatedPost;
    } catch (err) {
        console.error("Error while toggling like on post:", err);
        throw new Error("Unable to toggle like on post");
    }
}

// Method to find all children posts of a post
export async function findChildrenPosts(postId: string): Promise<any[]> {
    connect();

    try {
        const childrenPosts = await Post.find({ parentId: postId })

        const descendantPosts = [];
        for (const childrenPost of childrenPosts) {
            const descendants = await findChildrenPosts(childrenPost._id);
            descendantPosts.push(childrenPost, ...descendants);
        }

        return descendantPosts;
    } catch (err) {
        console.error("Error while fetching children posts:", err);
        throw new Error("Unable to fetch children posts");
    }
}

// Method to delete post
export async function deletePost(postId: string, path: string) {
    connect();

    try {
        // Find the post to be deleted (the main post)
        const mainPost = await Post.findById(postId).populate("author");

        if (!mainPost) {
            throw new Error("Post not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantPosts = await findChildrenPosts(postId);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantPostIds = [
            postId,
            ...descendantPosts.map((post) => post._id),
        ];

        // Extract the authorIds to update User model
        const uniqueAuthorIds = new Set(
            [
                ...descendantPosts.map((post) => post.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainPost.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Post.deleteMany({ _id: { $in: descendantPostIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantPostIds } } }
        );

        revalidatePath(path);
    } catch (err) {
        console.error("Error while deleting post:", err);
        throw new Error("Unable to delete post");
    }
}