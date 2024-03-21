import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <main className="flex max-w-3xl flex-col justify-center items-center py-20 min-h-screen">
    <SignUp />
</main>
    );
}