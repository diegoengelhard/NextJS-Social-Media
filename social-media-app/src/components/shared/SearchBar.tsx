'use client';
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";

// Import components
import { Input } from "@/components/ui/input";

// Define Props
interface Props {
    routeType: string;
}

const SearchBar = () => {
    const router = useRouter();
    const [search, setSearch] = useState("");

    return (
        <div className='searchbar'>
            <Image
                src='/assets/search-gray.svg'
                alt='search'
                width={24}
                height={24}
                className='object-contain'
            />
            <Input
                id='text'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search for a creator or a keyword of a post...'
                className='no-focus searchbar_input'
            />
        </div>
    )
}

export default SearchBar