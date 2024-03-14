import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="text-white">
      <h1 className="text-4xl font-bold text-white">Welcome to the social media app</h1>
      <UserButton afterSignOutUrl="/" />
    </main>
  )
}
