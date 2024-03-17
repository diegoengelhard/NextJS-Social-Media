import React from 'react';
import { redirect } from "next/navigation";

// Import user server actions
import { fetchUserPosts } from '@/lib/actions/user.actions';

// Import components
import PostCard from '@/components/cards/PostCard';

interface Result {
    name: string;
    image: string;
    id: string;
    posts: {
        _id: string;
        text: string;
        parentId: string | null;
        author: {
            name: string;
            image: string;
            id: string;
        };
        community: {
            id: string;
            name: string;
            image: string;
        } | null;
        createdAt: string;
        children: {
            author: {
                image: string;
            };
        }[];
    }[];
}

// Define props
interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

const ProfileTabs = async ({ currentUserId, accountId, accountType }: Props) => {
    let result: Result; // Define user with its posts as result
    result = await fetchUserPosts(accountId);
    // if (accountType === "Community") {
    //     result = await fetchCommunityPosts(accountId);
    // } else {
    //     result = await fetchUserPosts(accountId);
    // }

    if (!result) {
        redirect("/");
    }

    return (
        <section className='mt-9 flex flex-col gap-10'>
            {/* Render all user posts */}
            {result.posts.map((post) => (
                <PostCard
                    key={post._id}
                    id={post._id}
                    currentUserId={currentUserId}
                    parentId={post.parentId}
                    content={post.text}
                    author={
                        accountType === "User"
                            ? { name: result.name, image: result.image, id: result.id }
                            : {
                                name: post.author.name,
                                image: post.author.image,
                                id: post.author.id,
                            }
                    }
                    community={
                        accountType === "Community"
                            ? { name: result.name, id: result.id, image: result.image }
                            : post.community
                    }
                    createdAt={post.createdAt}
                    comments={post.children}
                />
            ))}
        </section>
    )
}

export default ProfileTabs