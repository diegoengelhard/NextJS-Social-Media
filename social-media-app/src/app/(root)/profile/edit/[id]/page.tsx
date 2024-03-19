import React from 'react';
import { currentUser } from "@clerk/nextjs";

import AccountProfile from '@/components/forms/AccountProfile';
import { fetchUser } from '@/lib/actions/user.actions';

const page = async () => {
    const user = await currentUser(); // fetchs user infd from clerk auth
    if (!user) return null; // to avoid typescript warnings

    const userInfo = await fetchUser(user.id);
    // if (userInfo.onboarded) redirect("/");

    console.log('user: ', user);
    console.log('userInfo: ', userInfo);


    const userData = {
        id: user.id,
        objectId: userInfo?._id,
        username: userInfo ? userInfo?.username : user.username,
        fullname: userInfo ? userInfo?.fullname : user.firstName ?? "",
        bio: userInfo ? userInfo?.bio : "",
        image: userInfo ? userInfo?.image : user.imageUrl,
    };

    return (
        <main>
            <h1 className='head-text'>Update profile</h1>
            <p className='mt-3 text-base-regular text-light-2'>
                Update your information.
            </p>

            <section className='mt-9 bg-dark-2 p-10'>
                <AccountProfile user={userData} btnTitle='Update' />
            </section>
        </main>
    )
}

export default page