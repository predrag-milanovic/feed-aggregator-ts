import { UserCommandHandler } from "./middleware";
import { getPostsForUser } from "../lib/db/queries/posts";

export const handlerBrowse: UserCommandHandler = async (cmdName, user, ...args) => {
  let limit = 2; // Default limit
  
  if (args.length > 1) {
    throw new Error(`usage: ${cmdName} [limit]`);
  }
  
  if (args.length === 1) {
    const parsedLimit = parseInt(args[0]);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      throw new Error(`limit must be a positive number`);
    }
    limit = parsedLimit;
  }
  
  const posts = await getPostsForUser(user.id, limit);
  
  if (posts.length === 0) {
    console.log("No posts found. Follow some feeds first!");
    return;
  }
  
  console.log(`Found ${posts.length} posts for user ${user.name}:\n`);
  
  for (const post of posts) {
    console.log(`* ${post.title}`);
    console.log(`  From: ${post.feedName}`);
    console.log(`  URL: ${post.url}`);
    if (post.publishedAt) {
      console.log(`  Published: ${post.publishedAt.toLocaleString()}`);
    }
    if (post.description) {
      // Truncate description to keep output manageable
      const maxDescLength = 100;
      const truncatedDesc = post.description.length > maxDescLength 
        ? post.description.substring(0, maxDescLength) + "..."
        : post.description;
      console.log(`  Description: ${truncatedDesc}`);
    }
    console.log(`=====================================`);
  }
};