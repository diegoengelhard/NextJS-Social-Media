'use client';
import React from 'react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

// Import actions
import { PostValidation } from '@/lib/validations/post.validation';
import { createPost, updatePost } from '@/lib/actions/posts.actions';

// Import components
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-toastify';

// Define props
interface Props {
    userId: string;
    postData?: {
        id: string;
        text: string;
    };
    edit?: boolean;
}

const PostForm = ({ userId, postData, edit = false }: Props) => {
    const router = useRouter(); //  define router
    const pathname = usePathname(); // obtain url pathname

    // Define form
    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            post: postData ? postData.text : "",
            accountId: userId,
        },
    });

    // Submit form function
    const onSubmit = async (values: z.infer<typeof PostValidation>) => {
        try {
            if (edit) {
                await updatePost(postData?.id ?? '', values.post, pathname); // update post
                toast.success('Post updated successfully');
            } else {
                const createPostData = {
                    text: values.post,
                    author: userId,
                    communityId: null,
                    path: pathname,
                }

                console.log('Post data: ', createPostData);

                await createPost(createPostData); // create post

                toast.success("Post created successfully");
            }

            // wait for 1 second before redirecting
            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (error: any) {
            console.log('Error creating post: ', error);
        }
    };

    return (
        <Form {...form}>
            <form
                className='mt-10 flex flex-col justify-start gap-10'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                <FormField
                    control={form.control}
                    name='post'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Content
                            </FormLabel>
                            <FormControl className='no-focus border border-dark-4 bg-dark-3 text-light-1'>
                                <Textarea rows={15} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type='submit' className='bg-primary-500'>
                    {edit ? "Update" : "Post"}
                </Button>
            </form>
        </Form>
    )
}

export default PostForm