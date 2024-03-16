'use client';
import React from 'react';
import { z } from "zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

// Import actions
import { CommentValidation } from '@/lib/validations/post.validation';
import { addCommentToPost } from '@/lib/actions/posts.actions';

// Import components
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define props
interface Props {
    postId: string;
    currentUserImg: string;
    currentUserId: string;
}

const CommentForm = ({ postId, currentUserImg, currentUserId }: Props) => {
    const pathname = usePathname(); // get url path

    // Define form
    const form = useForm<z.infer<typeof CommentValidation>>({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            post: "",
        },
    });

    // Form submit handler 
    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToPost(
            postId,
            values.post,
            JSON.parse(currentUserId),
            pathname
        );

        form.reset();
    };
    return (
        <Form {...form}>
            <form className='comment-form' onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name='post'
                    render={({ field }) => (
                        <FormItem className='flex w-full items-center gap-3'>
                            <FormLabel>
                                <Image
                                    src={currentUserImg}
                                    alt='current_user'
                                    width={48}
                                    height={48}
                                    className='rounded-full object-cover'
                                />
                            </FormLabel>
                            <FormControl className='border-none bg-transparent'>
                                <Input
                                    type='text'
                                    {...field}
                                    placeholder='Comment...'
                                    className='no-focus text-light-1 outline-none'
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <Button type='submit' className='comment-form_btn'>
                    Reply
                </Button>
            </form>
        </Form>
    )
}

export default CommentForm