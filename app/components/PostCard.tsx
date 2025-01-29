import { Link } from '@remix-run/react';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { MDXEditor, headingsPlugin, linkPlugin, imagePlugin, UndoRedo, BoldItalicUnderlineToggles, CreateLink, InsertImage } from '@mdxeditor/editor'

interface PostCardProps {
  post: {
    id: number;
    content: string;
    likes: number | null;
    created_at: string;
    user: {
      id: number;
      email: string;
      user_profile: {
        id: number;
        image: string | null;
        name: string;
      }[];
    };
    company: {
      id: number;
      name: string;
      avatar: string | null;
    } | null;
  };
  isLiked?: boolean;
  onLike?: (postId: number) => void;
}

export function PostCard({ post, isLiked, onLike }: PostCardProps) {
  const handleLike = () => {
    if (onLike) {
      onLike(post.id);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.company ? (
            <>
              <Link to={`/company/profile/${post.company.id}`} className="flex items-center gap-2">
                {post.company.avatar && (
                  <img
                    src={post.company.avatar}
                    alt={post.company.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="font-medium">{post.company.name}</span>
              </Link>
              <span className="text-gray-500">via</span>
            </>
          ) : null}
          <Link to={`/user/${post.user.id}/profile`} className="flex items-center gap-2">
        
              <img
                src={post.user.user_profile[0].image || 
                  "https://cdn.yazarodasi.com/profile-photo-placeholder.webp"}
                alt={post.user.email}
                className="w-12 h-12 rounded-full"
              />
   
            <span className="font-medium">{post.user.user_profile[0]?.name || post.user.email}</span>
          </Link>
        </div>
        <span className="text-sm text-gray-500">
          {new Date(post.created_at).toLocaleDateString('tr-TR')}
        </span>
      </div>

      <div data-color-mode="light">
        <MDXEditor markdown={post.content} readOnly plugins={[headingsPlugin(), linkPlugin(), imagePlugin()]}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${isLiked ? 'text-red-500' : ''}`}
          onClick={handleLike}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{post.likes ?? 0}</span>
        </Button>
      </div>
    </div>
  );
}
