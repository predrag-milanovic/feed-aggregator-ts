import { createFeed, getFeeds } from "../lib/db/queries/feeds";
import { getUserById } from "../lib/db/queries/users";
import { Feed, User } from "src/lib/db/schema";
import { createFeedFollow } from '../lib/db/queries/feed-follows';
import { UserCommandHandler } from "./middleware";

export const handlerAddFeed: UserCommandHandler = async (cmdName, user, ...args) => {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <feed_name> <url>`);
  }
  const feedName = args[0];
  const url = args[1];

  const feed = await createFeed(feedName, url, user.id);
  if (!feed) {
    throw new Error(`Failed to create feed`);
  }

  console.log("Feed created successfully:");
  printFeed(feed, user);

  // Auto-follow after creating feed
  try {
    const res = await createFeedFollow(user.id, feed.id);
    if (res === 'already-following') {
      console.log(`Already following ${feed.name}`);
    } else {
      console.log(`${res.feedName} followed by ${res.userName}`);
    }
  } catch (err: any) {
    if (err.code === '23505') {
      console.log(`Already following ${feed.name}`);
    } else {
      throw err;
    }
  }
}

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

export async function handlerListFeeds(_: string) {
  const feeds = await getFeeds();

  if (feeds.length === 0) {
    console.log(`No feeds found.`);
    return;
  }

  console.log(`Found %d feeds:\n`, feeds.length);
  for (let feed of feeds) {
    const user = await getUserById(feed.userId);
    if (!user) {
      throw new Error(`Failed to find user for feed ${feed.id}`);
    }

    printFeed(feed, user);
    console.log(`=====================================`);
  }
}
