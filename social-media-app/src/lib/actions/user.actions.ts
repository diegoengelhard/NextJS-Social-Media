'use server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from "next/cache";

import User from '@/lib/models/User.model';

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
    try {
        connect();

        const user = await User.findOne({ id: userId })
        // .populate({
        //     path: "communities",
        //     model: Community,
        // });

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