import { PostCard } from "./PostCard";

interface Post {
  id: number;
  content: string;
  likes: number | null;
  created_at: string;
  user: {
    id: number;
    email: string;
    image: string | null;
  };
  company: {
    id: number;
    name: string;
    avatar: string | null;
  } | null;
}

interface PostFeedProps {
  posts: Post[];
  likedPostIds?: number[];
  onLike?: (postId: number) => void;
}

export function PostFeed({ posts, likedPostIds = [], onLike }: PostFeedProps) {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLiked={likedPostIds.includes(post.id)}
          onLike={onLike}
        />
      ))}
      {posts.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Henüz gönderi yok
        </div>
      )}
    </div>
  );
}
