import React from 'react';
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchUser } from '@/lib/actions/user.actions';

import PostForm from '@/components/forms/PostForm';

const page = async () => {
    // obtain current user session
    const user = await currentUser();
    if (!user) return null;

    // fetch user info from db
    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    return (
        <>
            <h1 className='head-text'>Create Post</h1>
            <PostForm userId={userInfo._id} />
        </>
    )
}

export default page