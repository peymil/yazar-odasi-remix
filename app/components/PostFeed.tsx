import { ClientOnly } from 'remix-utils/client-only';
import { PostCard } from './PostCard';
import { company, post, user, user_profile } from '@prisma/client';

interface PostFeedProps {
  posts: (post & {
    likes: number | null;
    company?: company | null;
    user: (user | null) & { user_profile: user_profile[] };
  })[];
  likedPostIds?: number[];
  onLike?: (postId: number) => void;
}

export function PostFeed({ posts, likedPostIds = [], onLike }: PostFeedProps) {
  return (
    <div className="space-y-6">
      <ClientOnly>
        {() => (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPostIds.includes(post.id)}
                onLike={onLike}
              />
            ))}
          </>
        )}
      </ClientOnly>

      {posts.length === 0 && (
        <div className="text-center text-gray-500 py-8">Henüz gönderi yok</div>
      )}
    </div>
  );
}
