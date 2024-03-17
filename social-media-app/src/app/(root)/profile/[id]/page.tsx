import React from 'react';
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

// Import lib user actions
import { fetchUser } from "@/lib/actions/user.actions";

// Import components
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const page = async ({ params }: { params: { id: string } }) => {
    const user = await currentUser(); // Get current user from clerk session
    if (!user) return null;

    const userInfo = await fetchUser(params.id); // Fetch user info by id from params
    if (!userInfo?.onboarded) redirect("/onboarding");

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
        </section>
    )
}

export default page