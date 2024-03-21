'use client';
import React, { ChangeEvent, useState, useEffect } from "react";
import * as z from "zod";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { usePathname, useRouter, useParams, redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'react-toastify';

// Import lib methods
import { UserValidation } from '@/lib/validations/user.validation';
import { useUploadThing } from '@/lib/uploadthing';
import { isBase64Image } from "@/lib/utils";

// Import server actions
import { updateUser } from "@/lib/actions/user.actions";

// Import components
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';


// Define component props
interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        fullname: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}


const AccountProfile = ({ user, btnTitle }: Props) => {
    const params = useParams();

    if (user.id !== params.id) redirect('/'); // checks if user id from params = user id who's signed in

    const router = useRouter(); // Get the router object
    const pathname = usePathname(); // Get the current url pathname
    const { startUpload } = useUploadThing("media");

    // Set states
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    // Define the form & its validation from the Zod UserValidation schema
    const form = useForm<z.infer<typeof UserValidation>>({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            profile_photo: user?.image ? user.image : "",
            fullname: user?.fullname ? user.fullname : "",
            username: user?.username ? user.username : "",
            bio: user?.bio ? user.bio : "",
        },
    });

    // Handle the form submit -> returns UserValidation object
    const onSubmit = async (values: z.infer<typeof UserValidation>) => {
        const userData = {
            userId: user.id,
            fullname: values.fullname,
            username: user.username,
            bio: values.bio,
            image: values.profile_photo,
            onboarded: true,
            path: pathname,
        };

        if (!(userData.userId || userData.fullname || userData.username || userData.bio || userData.image)) {
            return toast.error('Missing fields... All fields are required!');
        }

        console.log(userData);

        try {
            setLoading(true);

            const blob = values.profile_photo;

            const hasImageChanged = isBase64Image(blob);
            if (hasImageChanged) {
                const imgRes = await startUpload(files);

                if (imgRes && (imgRes[0] as any).fileUrl) {
                    values.profile_photo = (imgRes[0] as any).fileUrl;
                }
            }
            
            await updateUser(userData);

            setLoading(false);

            toast.success('Profile updated successfully!');

            if (pathname === "/profile/edit") {
                router.back();
            } else {
                router.push("/");
            }
        } catch (error: any) {
            setLoading(false);
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
        e.preventDefault();

        const fileReader = new FileReader(); // reads file from pc

        // if file exists, upload it
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFiles(Array.from(e.target.files));

            if (!file.type.includes("image")) return;

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || "";
                fieldChange(imageDataUrl);
            };

            fileReader.readAsDataURL(file);
        }
    };

    return (
        <Form {...form}>
            <form
                className='flex flex-col justify-start gap-10'
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {/* User profile pic field */}
                <FormField
                    control={form.control}
                    name='profile_photo'
                    render={({ field }) => (
                        <FormItem className='flex items-center gap-4'>
                            <FormLabel className='account-form_image-label'>
                                {/* Display user profile pic if value exists */}
                                {field.value ? (
                                    <Image
                                        src={field.value}
                                        alt='profile_icon'
                                        width={96}
                                        height={96}
                                        priority
                                        className='rounded-full object-contain'
                                    />
                                ) : (
                                    // Display default profile pic if user doesnt have profile pic
                                    <Image
                                        src='/assets/profile.svg'
                                        alt='profile_icon'
                                        width={24}
                                        height={24}
                                        className='object-contain'
                                    />
                                )}
                            </FormLabel>

                            {/* Photo picker */}
                            <FormControl className='flex-1 text-base-semibold text-gray-200'>
                                <Input
                                    type='file'
                                    accept='image/*'
                                    placeholder='Add profile photo'
                                    className='account-form_image-input'
                                    onChange={(e) => handleImage(e, field.onChange)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* User fullname field */}
                <FormField
                    control={form.control}
                    name='fullname'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type='text'
                                    className='account-form_input no-focus'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* User username field */}
                <FormField
    control={form.control}
    name='username'
    render={({ field }) => (
        <FormItem className='flex w-full flex-col gap-3'>
            <FormLabel className='text-base-semibold text-light-2'>
                Username
            </FormLabel>
            <FormControl>
                <Input
                    type='text'
                    className='account-form_input no-focus'
                    {...field}
                    disabled
                    title="Username is unique and cannot be changed"
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    )}
/>

                {/* User bio field */}
                <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                        <FormItem className='flex w-full flex-col gap-3'>
                            <FormLabel className='text-base-semibold text-light-2'>
                                Bio
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={10}
                                    className='account-form_input no-focus'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Continue to home btn */}
                <Button type='submit' className='bg-primary-500' disabled={loading}>
                    {loading ? 'Updating User...' : btnTitle}
                </Button>
            </form>
        </Form>
    )
}

export default AccountProfile