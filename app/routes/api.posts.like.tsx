import { json, type ActionFunctionArgs } from "@remix-run/node";
import { validateSessionToken } from "~/.server/auth";
import { authTokenCookie } from "~/.server/cookies";
import { prisma } from "~/.server/prisma";
export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const cookieHeader = request.headers.get("Cookie");
  const sessionToken = await authTokenCookie.parse(cookieHeader);

  if (!sessionToken) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await validateSessionToken(sessionToken);
  if (!session?.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const postId = formData.get("postId");

  if (!postId || typeof postId !== "string") {
    return json({ error: "Post ID is required" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(postId) },
    include: {
      post_like: {
        where: { user_id: session.user.id },
      },
    },
  });

  if (!post) {
    return json({ error: "Post not found" }, { status: 404 });
  }

  try {
    if (post.post_like.length > 0) {
      // Unlike
      await prisma.$transaction([
        prisma.post_like.delete({
          where: {
            user_id_post_id: {
              user_id: session.user.id,
              post_id: post.id,
            },
          },
        }),
        prisma.post.update({
          where: { id: post.id },
          data: {
            likes: (post.likes || 0) - 1,
          },
        }),
      ]);
    } else {
      // Like
      await prisma.$transaction([
        prisma.post_like.create({
          data: {
            user_id: session.user.id,
            post_id: post.id,
          },
        }),
        prisma.post.update({
          where: { id: post.id },
          data: {
            likes: (post.likes || 0) + 1,
          },
        }),
      ]);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
