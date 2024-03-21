import React from 'react'
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser } from '@/lib/actions/user.actions';
import { fetchPostById } from '@/lib/actions/posts.actions';

import PostForm from '@/components/forms/PostForm';

const page = async ({ params }: { params: { id: string } }) => {
    if (!params.id) return null;

    // obtain current user session
    const user = await currentUser();
    if (!user) return null;

    // fetch user info from db
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const post = await fetchPostById(params.id); // fetch post by id from db
    if (!post) return null;

    console.log('POST: ', post);

    const postData = {
        id: post._id,
        text: post.text,
    }

    return (
        <>
            <h1 className='head-text'>Edit Post</h1>
            <PostForm userId={userInfo._id} postData={postData} edit={true} />
        </>
    )
}

export default page