import React from 'react';
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Import lib server user actions
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchUserPosts } from '@/lib/actions/user.actions';
import { fetchPostsByAuthor } from '@/lib/actions/user.actions';

// Import components
import ProfileHeader from "@/components/shared/ProfileHeader";
import ProfileTabs from '@/components/shared/ProfileTabs';
import PostCard from '@/components/cards/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import constants
import { profileTabs } from '@/constants';

const page = async ({ params }: { params: { id: string } }) => {
    const user = await currentUser(); // Get current user from clerk session
    if (!user) return null;

    const userInfo = await fetchUser(params.id); // Fetch user info by id from params
    if (!userInfo?.onboarded) redirect("/onboarding");

    const posts = await fetchPostsByAuthor(userInfo._id);

    return (
        <section>
            {/* User header */}
            <ProfileHeader
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.fullname}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <section className='mt-9 flex flex-col gap-10'>
                <h2 className='text-left text-heading3-bold text-light-1'>
                    Posts
                </h2>
                {/* Render all user posts */}
                {posts.map((post) => (
                    <PostCard
                        key={post._id}
                        id={post._id}
                        currentUserId={user.id}
                        parentId={post.parentId}
                        content={post.text}
                        author={post.author}
                        community={post.community}
                        createdAt={post.createdAt}
                        comments={post.children}
                        likes={post.likes}
                    />
                ))}
            </section>
        </section>
    )
}

export default page