import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { PostFeed } from "~/components/PostFeed";
import { SignUp } from "~/components/sign-up";
import { useOptionalUser } from "~/lib/authUtils";
import { validateSessionToken } from "~/.server/auth";
import { authTokenCookie } from "~/.server/cookies";
import { prisma } from "~/.server/prisma";

export const meta: MetaFunction = () => {
    return [
        {title: "Yazar Odasi"},
        {name: "description", content: "Yazarodasi is a place for writers."},
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const cookieHeader = request.headers.get("Cookie");
    const sessionToken = await authTokenCookie.parse(cookieHeader);

    if (!sessionToken) {
        return json({ posts: [], likedPostIds: [] });
    }

    const session = await validateSessionToken(sessionToken);
    if (!session?.user) {
        return json({ posts: [], likedPostIds: [] });
    }

    const posts = await prisma.post.findMany({
        orderBy: { created_at: 'desc' },
        take: 20,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    image: true,
                },
            },
            company: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });

    const likedPosts = await prisma.post_like.findMany({
        where: { user_id: session.user.id },
        select: { post_id: true },
    });
    return json({
        posts,
        likedPostIds: likedPosts.map(like => like.post_id),
    });
}

export default function Index() {
    const isAuthenticated = useOptionalUser();
    const { posts, likedPostIds } = useLoaderData<typeof loader>();

    const fetcher = useFetcher();
    const [optimisticLikes, setOptimisticLikes] = useState<Record<number, boolean>>({});

    const handleLike = (postId: number) => {
        const formData = new FormData();
        formData.append("postId", postId.toString());
        
        const isCurrentlyLiked = likedPostIds.includes(postId);
        
        // Optimistically update the UI
        setOptimisticLikes((prev) => ({
            ...prev,
            [postId]: !isCurrentlyLiked
        }));
        
        fetcher.submit(formData, {
            method: "post",
            action: "/api/posts/like",
        });
    };

    const getOptimisticLikeCount = (post: (typeof posts)[0]) => {
        const isCurrentlyLiked = likedPostIds.includes(post.id);
        const hasOptimisticUpdate = optimisticLikes.hasOwnProperty(post.id);
        const isOptimisticallyLiked = optimisticLikes[post.id];
        
        if (!hasOptimisticUpdate) {
            return post.likes || 0;
        }
        
        return isOptimisticallyLiked ? 
            (isCurrentlyLiked ? post.likes || 0 : (post.likes || 0) + 1) :
            (isCurrentlyLiked ? (post.likes || 0) - 1 : post.likes || 0);
    };

    const isPostLiked = (postId: number) => {
        const hasOptimisticUpdate = optimisticLikes.hasOwnProperty(postId);
        return hasOptimisticUpdate ? optimisticLikes[postId] : likedPostIds.includes(postId);
    };

    return (isAuthenticated ? (
        <div className="container mx-auto py-8">
            <PostFeed
                posts={posts.map(post => ({
                    ...post,
                    likes: getOptimisticLikeCount(post)
                }))}
                likedPostIds={posts.map(post => post.id).filter(isPostLiked)}
                onLike={handleLike}
            />
        </div>
    ) : (
        <div className={"container mx-auto flex items-center justify-center h-[calc(100vh-144px)]"}>
            <div className={'flex-1 flex flex-col justify-center items-center'}>
                <img src={'https://cdn.yazarodasi.com/startup-hero.png'} alt={'Illustration of three writers smiling'}/>
                <h1 className={'text-5xl'}>{"Yazar Odası'na Katıl"}</h1>
                <p className={'text-center'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mattis mauris a magna venenatis
                    semper. Suspendisse placerat porta orci, a vehicula sem suscipit feugiat.</p>
            </div>
            <div className={'flex-1 p-56'}>
                <SignUp action={'/auth/sign-up'} />
            </div>
        </div>
    ));
}
