import React from 'react';
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Import lib user actions
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchPostsByAuthor } from '@/lib/actions/user.actions';

// Import components
import ProfileHeader from "@/components/shared/ProfileHeader";
import ProfileTabs from '@/components/shared/ProfileTabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import constants
import { profileTabs } from '@/constants';

const page = async ({ params }: { params: { id: string } }) => {
    const user = await currentUser(); // Get current user from clerk session
    if (!user) return null;

    const userInfo = await fetchUser(params.id); // Fetch user info by id from params
    if (!userInfo?.onboarded) redirect("/onboarding");

    const posts = await fetchPostsByAuthor(userInfo._id);
    console.log("Posts: ", posts);

    console.log("_id", userInfo._id);

    return (
        <section>
            {/* User header */}
            <ProfileHeader
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <div className='mt-9'>
                <Tabs defaultValue='threads' className='w-full'>
                    <TabsList className='tab'>
                        {profileTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                                <Image
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className='object-contain'
                                />
                                <p className='max-sm:hidden'>{tab.label}</p>

                                {tab.label === "Posts" && (
                                    <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                                        {userInfo.posts.length}
                                    </p>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {profileTabs.map((tab) => (
                        <TabsContent
                            key={`content-${tab.label}`}
                            value={tab.value}
                            className='w-full text-light-1'
                        >
                            {/* @ts-ignore */}
                            <ProfileTabs
                                currentUserId={user.id}
                                accountId={userInfo._id}
                                accountType='User'
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    )
}

export default page