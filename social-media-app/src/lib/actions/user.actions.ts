'use server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from "next/cache";
import mongoose, { FilterQuery, SortOrder } from "mongoose";

import User from '@/lib/models/User.model';
import Post from '@/lib/models/Post.model';

import { connect } from '@/config/mongoose';

// Define user params
interface Params {
    userId: string;
    username: string;
    fullname: string;
    bio: string;
    image: string;
    path: string;
}

// Method to get User
export async function fetchUser(userId: string) {
    connect();

    try {

        const user = await User.findOne({ id: userId });

        console.log("User fetched successfully: ", user);
        
        return user;
    } catch (error: any) {
        console.log('Error fetching user: ', error);
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

// Method to Update User
export async function updateUser({ userId, bio, fullname, path, username, image }: Params): Promise<void> {
    try {
        connect();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                fullname,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        // Revalidate the path if it's the profile edit page
        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

// Method to get all user posts
export async function fetchUserPosts(userId: string) {
    try {
        connect();

        // Find all posts authored by the user with the given userId
        const posts = await User.findOne({ id: userId }).populate({
            path: "posts",
            model: Post,
            populate: [
                // {
                //     path: "community",
                //     model: Community,
                //     select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                // },
                {
                    path: "children",
                    model: Post,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
            ],
        });

        return posts;
    } catch (error) {
        console.log("Error fetching user threads: ", error);
        throw error;
    }
}

// Method to get all posts given an author
export async function fetchPostsByAuthor(authorId: string) {
    connect();

    // Create a query to fetch the posts that have no parent (top-level posts) and are authored by the specified user.
    const postsQuery = Post.find({ parentId: { $in: [null, undefined] }, author: new mongoose.Types.ObjectId(authorId) })
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

    const posts = await postsQuery.exec();

    return posts;
}

// Method to search users by username
export async function searchUsers(keyword: string): Promise<any> {
    try {
        connect();
        const users = await User.find({ username: { $regex: keyword, $options: 'i' } });
        return users;
    } catch (error) {
        console.error("Error searching users: ", error);
        throw new Error("Unable to search users");
    }
}

// Method to get user's activity e.g someone replied, liked your post
export async function getActivity(userId: string) {
    try {
        connect();

        // Find all posts created by the user
        const posts = await Post.find({ author: userId });

        // Collect all the child posts ids (replies) from the 'children' field of each user thread
        const childrenPostIds = posts.reduce((acc: string[], post) => {
            return acc.concat(post.children);
        }, []);

        // Find and return the child posts (replies) excluding the ones created by the same user
        const replies = await Post.find({
            _id: { $in: childrenPostIds },
            author: { $ne: userId }, // Exclude threads authored by the same user
        }).populate({
            path: "author",
            model: User,
            select: "name image _id",
        });

        // Find and return the posts that the user liked
        // TODO

        return replies;

    } catch (error) {
        console.error("Error getting activity: ", error);
        throw new Error("Unable to user's activity");
    }
}