'use client';
import React, { useState } from 'react';
import Image from "next/image";
import { usePathname } from "next/navigation";
import { toggleLikeOnPost } from '@/lib/actions/posts.actions';

// Define props
interface Props {
    postId: string;
    userId: string;
    likes: string[];
}

const LikePost = ({ postId, userId, likes }: Props) => {
    // Set post likes
    const [postLikes, setPostLikes] = useState(likes);

    const pathname = usePathname(); // obtain url pathname

    // Determine if user has liked post
    const hasLiked = likes.includes(userId);

    // Like post function
    const likePost = async () => {
        try {
            await toggleLikeOnPost(postId, userId, pathname); // like post

            // Update post likes
            if (hasLiked) {
                setPostLikes(likes.filter((like) => like !== userId));
            } else {
                setPostLikes([...likes, userId]);
            }
        } catch (error) {
            console.log('Error liking post: ', error);
        }
    }

    // Return like post component
    // Return like post component
    const Likes = () => {
        if (postLikes.length > 0) {
            if (hasLiked) {
                return (
                    <>
                        <div className="flex space-x-2">
                            <span>{postLikes.length}</span>
                            <Image
                                src='/assets/heart-filled.svg'
                                alt='heart'
                                width={24}
                                height={24}
                                className='cursor-pointer object-contain'
                                onClick={likePost}
                            />
                        </div>
                    </>
                );
            } else {
                return (
                    <>
                        <div className="flex space-x-2">
                            <span>{postLikes.length}</span>
                            <Image
                                src='/assets/heart-gray.svg'
                                alt='heart'
                                width={24}
                                height={24}
                                className='cursor-pointer object-contain'
                                onClick={likePost}
                            />
                        </div>
                    </>
                );
            }
        } else {
            return (
                <Image
                    src='/assets/heart-gray.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                    onClick={likePost}
                />
            );
        }
    }

    return (
        <Likes />
    )
}

export default LikePost