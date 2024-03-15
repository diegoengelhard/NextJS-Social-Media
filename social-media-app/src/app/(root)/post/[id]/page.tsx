import React from 'react';
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from '@/lib/actions/user.actions';
import { fetchPostById } from '@/lib/actions/posts.actions';

import PostCard from "@/components/cards/PostCard";

const page = async ({ params }: { params: { id: string } }) => {
    if (!params.id) return null;
    
    const user = await currentUser(); // obtain user session from Clerk
    if (!user) return null;

    const userInfo = await fetchUser(user.id); // fetch user info from db
    if (!userInfo?.onboarded) redirect("/onboarding"); // redirect to onboarding page if user is not onboarded

    const post = await fetchPostById(params.id); // fetch post by id from db
    if (!post) return null;
    
    return (
        <>
             <section className='relative'>
                <div>
                    {/* render single post */}
                    <PostCard
                        id={post._id}
                        currentUserId={user.id}
                        parentId={post.parentId}
                        content={post.text}
                        author={post.author}
                        community={post.community}
                        createdAt={post.createdAt}
                        comments={post.children}
                    />
                </div>
             </section>
        </>
    )
}

export default page