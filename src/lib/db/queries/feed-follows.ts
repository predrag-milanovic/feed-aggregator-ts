import { users, feeds, feedFollows } from '../schema';
// Create a feed follow and return join info
export async function createFeedFollow(userId: string, feedId: string) {
  try {
    await db.insert(feedFollows).values({ userId, feedId }).onConflictDoNothing();
  } catch (err: any) {
    if (err.code === '23505') {
      return 'already-following';
    }
    throw err;
  }
  const result = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)))
    .limit(1);
  return result[0];
}

// List feeds followed by a user, newest first
export async function getFeedFollowsForUser(userId: string) {
  const result = await db
    .select({ feedName: feeds.name })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(feedFollows.createdAt));
  return result;
}
import { db } from '../index';
// Make sure feedFollows is exported from the correct module
import { eq, and, desc } from 'drizzle-orm';

// Insert a feed follow
export async function followFeed(userId: string, feedId: string) {
  return db.insert(feedFollows).values({ userId, feedId }).onConflictDoNothing();
}

// List feeds followed by a user (joined with feeds table)
export async function getFeedsFollowedByUser(userId: string) {
  return db
    .select({
      followId: feedFollows.id,
      followedAt: feedFollows.createdAt,
      feed: feeds,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .where(eq(feedFollows.userId, userId));
}
