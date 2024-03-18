import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs";
import { fetchPosts } from "@/lib/actions/posts.actions";

import PostCard from "@/components/cards/PostCard";

export default async function Home() {
  const user = await currentUser();
  if (!user) return null;

  const result = await fetchPosts();
  console.log("Posts: ", result);

  return (
    <main className="text-white">
      <h1 className="text-4xl font-bold text-white">Welcome to the social media app</h1>
      <UserButton afterSignOutUrl="/" />

      {/* Render fetched posts */}
      <section className='mt-9 flex flex-col gap-10'>
        {result.posts.length === 0 ? (
          <p className='no-result'>No posts found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <PostCard
                key={post._id}
                id={post._id}
                currentUserId={user.id}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </main>
  )
}
