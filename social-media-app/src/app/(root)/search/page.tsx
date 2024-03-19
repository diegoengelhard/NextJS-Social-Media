import React from 'react';
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

// Import lib user actions
import { fetchUser } from "@/lib/actions/user.actions";

// Import components
import SearchBar from "@/components/shared/SearchBar";

const page = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    return (
        <section>
            <h1 className='head-text mb-10'>Search</h1>

            <SearchBar />

        </section>
    )
}

export default page;