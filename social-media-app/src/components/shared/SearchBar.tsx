'use client';
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";

// Import lib server actions
import { searchUsers } from '@/lib/actions/user.actions';
import { searchPosts } from '@/lib/actions/posts.actions';

// Import components
import { Input } from "@/components/ui/input";

// Define Props
interface Props {
    currentUserId: string;
}

// Define Query Type reuslt will return 
interface SearchResult {
    type: string; // 'user' or 'post'
    data: any[]; // array of user objects or post objects
}

const SearchBar = ({ currentUserId }: Props) => {
    const router = useRouter();
    const [search, setSearch] = useState("");

    const onSearchHandler = async () => {
        router.push(`/search?q=${search}`);
    }

    // const searchHandler = async () => {
    //     setLoading(true);
    //     const userResults = await searchUsers(search);
    //     const postResults = await searchPosts(search);
    //     setResults([
    //         { type: 'user', data: userResults },
    //         { type: 'post', data: postResults }
    //     ]);
    //     setLoading(false);
    // };

    return (
        <>
            {/* SearchBar component */}
            <div className='searchbar'>
                <div onClick={onSearchHandler}>
                    <Image
                        src='/assets/search-gray.svg'
                        alt='search'
                        width={24}
                        height={24}
                        className='object-contain'
                    />
                </div>
                <Input
                    id='text'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder='Search for a creator or a keyword of a post...'
                    className='no-focus searchbar_input'
                />
            </div>
        </>
    )
}

export default SearchBar