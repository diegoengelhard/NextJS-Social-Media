'use client';
import React from 'react'
import Image from "next/image";
import { useRouter } from "next/navigation";

// Import components
import { Button } from "@/components/ui/button";

// Define props
interface Props {
    id: string;
    fullname: string;
    username: string;
    imgUrl: string;
    personType: string;
}

const UserCard = ({ id, fullname, username, imgUrl, personType }: Props) => {
    const router = useRouter();
    return (
        <article className='user-card'>
            <div className='user-card_avatar'>
                <div className='relative h-12 w-12'>
                    <Image
                        src={imgUrl}
                        alt='user_logo'
                        fill
                        className='rounded-full object-cover'
                    />
                </div>

                <div className='flex-1 text-ellipsis'>
                    <h4 className='text-base-semibold text-light-1'>{fullname}</h4>
                    <p className='text-small-medium text-gray-1'>@{username}</p>
                </div>
            </div>

            <Button
                className='user-card_btn'
                onClick={() => router.push(`/profile/${id}`)}
            >
                View
            </Button>
        </article>
    )
}

export default UserCard