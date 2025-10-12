import { db } from "..";
import { feeds } from "../schema";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds).values({
    name,
    url,
    userId
  }).returning();
  return result;
}

export async function getFeedsByUser(userId: string) {
  const result = await db.select().from(feeds).where(eq(feeds.userId, userId));
  return result;
}