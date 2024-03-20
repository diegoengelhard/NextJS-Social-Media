import React from 'react';
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

// Import lib user actions
import { fetchUser } from "@/lib/actions/user.actions";
import { searchPosts } from '@/lib/actions/posts.actions';
import { searchUsers } from '@/lib/actions/user.actions';

// Import components
import Image from "next/image";
import SearchBar from "@/components/shared/SearchBar";
import PostCard from '@/components/cards/PostCard';
import UserCard from '@/components/cards/UserCard';
import { Input } from "@/components/ui/input";


interface ResponseData {
    type: string;
    data: any; // Replace 'any' with the actual type of 'userResults' and 'postResults'
}

const page = async ({ searchParams }: { searchParams: { [key: string]: string | undefined }; }) => {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    console.log(searchParams.q);
    const search = searchParams.q || ""; // Set a default value of an empty string if searchParams.q is undefined
    let results: ResponseData[];

    const userResults = await searchUsers(search);
    const postResults = await searchPosts(search);

    results = [
        { type: 'user', data: userResults },
        { type: 'post', data: postResults }
    ];
    console.log('QUERY:', results);

    console.log('User Data:', results[0].data);
    console.log('Post Data:', results[1].data);


    // const keyword = 'kaka';
    // const posts = await searchPosts(keyword);
    // console.log(posts)

    return (
        <section>
            <h1 className='head-text mb-10'>Search</h1>

            <SearchBar currentUserId={user.id} />

            
                {results.length > 0 ? (
                    results.map((result, index) => (
                        <div key={index}>
                            <h3>{result.type === 'user' ? 'Users' : 'Posts'}</h3>
                            <ul>
                                {result.data.map((item, idx) => (
                                    <li key={idx}>
                                        {result.type === 'user' ? 
                                            <UserCard 
                                                id={item.id}
                                                fullname={item.fullname}
                                                username={item.username}
                                                imgUrl={item.image}
                                                personType={result.type}
                                            /> :
                                            <PostCard 
                                                id={item._id}
                                                currentUserId={user.id}
                                                parentId={item.parentId}
                                                content={item.text}
                                                author={item.author}
                                                community={item.community}
                                                createdAt={item.createdAt}
                                                comments={item.comments}
                                                isComment={item.isComment}
                                            />
                                        }
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p>No results found.</p>
                )}
           
        </section>
    )
}

export default page;