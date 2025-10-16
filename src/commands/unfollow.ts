import { UserCommandHandler } from "./middleware";
import { deleteFeedFollowByUserAndUrl } from "../lib/db/queries/feed-follows";

export const handlerUnfollow: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <feed_url>`);
  }
  const feedUrl = args[0];
  const result = await deleteFeedFollowByUserAndUrl(user.id, feedUrl);
  // Drizzle returns number of deleted rows for delete
  if (typeof result === 'number' && result > 0) {
    console.log(`Unfollowed feed: ${feedUrl}`);
  } else {
    console.log(`Feed not followed or not found: ${feedUrl}`);
  }
};
