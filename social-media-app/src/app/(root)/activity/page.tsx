import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";

const page = async () => {
    const user = await currentUser(); // Get the current user frm clerk

    if (!user) return null;

    const userInfo = await fetchUser(user.id); // Fetch the user info from db
    if (!userInfo?.onboarded) redirect("/onboarding");

    const activity = await getActivity(userInfo._id); // Fetch the user activity from db

    return (
        <>
            <h1 className='head-text'>Activity</h1>

            <section className='mt-10 flex flex-col gap-5'>
                {activity.length > 0 ? (
                    <>
                        {activity.map((activity) => (
                            <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                                <article className='activity-card'>
                                    <Image
                                        src={activity.author.image}
                                        alt='user_logo'
                                        width={20}
                                        height={20}
                                        className='rounded-full object-cover'
                                    />
                                    <p className='!text-small-regular text-light-1'>
                                        <span className='mr-1 text-primary-500'>
                                            {activity.author.name}
                                        </span>{" "}
                                        replied to your post
                                    </p>
                                </article>
                            </Link>
                        ))}
                    </>
                ) : (
                    <p className='!text-base-regular text-light-3'>No activity yet</p>
                )}
            </section>
        </>
    )
}

export default page