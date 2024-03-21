'use client';
import React from 'react'
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

// Import lib post server actions
import { deletePost } from "@/lib/actions/posts.actions";

import { toast } from 'react-toastify';

interface Props {
    postId: string;
    parentId: string | null;
    isComment?: boolean;
}

const DeletePost = ({ postId, parentId, isComment }: Props) => {
    const pathname = usePathname(); // obtain url pathname
    const router = useRouter(); // define router

    // Delete post function
    const removePost = async () => {
        try {
            await deletePost(postId, pathname); // delete post

            toast.success('Post deleted successfully');

            if (!isComment && !parentId) {
                router.push('/'); // redirect to home
            }

            // wait for 1 second before redirecting
            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (error) {
            console.log('Error deleting post: ', error);
        }
    }
    return (
        <Image
            src='/assets/trash.svg'
            alt='heart'
            width={20}
            height={20}
            className='cursor-pointer object-contain'
            onClick={removePost}
        />
    )
}

export default DeletePost