import { eq, desc } from "drizzle-orm";
import { db } from "..";
import { posts, feeds, feedFollows } from "../schema";
import { firstOrUndefined } from "./utils";

export async function createPost(
  title: string,
  url: string,
  description: string | null,
  publishedAt: Date | null,
  feedId: string
) {
  try {
    const result = await db
      .insert(posts)
      .values({
        title,
        url,
        description,
        publishedAt,
        feedId,
      })
      .returning();

    return firstOrUndefined(result);
  } catch (error: any) {
    // Handle duplicate URL constraint violation
    if (error.code === '23505') {
      return null; // Post already exists
    }
    throw error;
  }
}

export async function getPostsForUser(userId: string, limit: number = 10) {
  const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt), desc(posts.createdAt))
    .limit(limit);

  return result;
}