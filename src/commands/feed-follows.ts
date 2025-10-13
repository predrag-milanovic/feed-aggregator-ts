import { readConfig } from '../config';
import { getFeedByUrl } from '../lib/db/queries/feeds';
import { createFeedFollow, getFeedFollowsForUser } from '../lib/db/queries/feed-follows';
import { getUser } from '../lib/db/queries/users';

export async function follow(_cmd: string, url: string) {
  const config = readConfig();
  const userName = config.currentUserName;
  if (!userName) {
    console.log('No user logged in.');
    return;
  }
  const user = await getUser(config.currentUserName);
  if (!user) {
    console.log('User not found.');
    return;
  }
  const feed = await getFeedByUrl(url);
  if (!feed) {
    console.log('Feed not found for URL:', url);
    return;
  }
  const result = await createFeedFollow(user.id, feed.id);
  if (result === 'already-following') {
    console.log(`Already following ${feed.name}`);
    return;
  }
  console.log(`${result.feedName} followed by ${result.userName}`);
}

export async function following(_cmd: string) {
  const config = readConfig();
  const userName = config.currentUserName;
  if (!userName) {
    console.log('No user logged in.');
    return;
  }
  const user = await getUser(config.currentUserName);
  if (!user) {
    console.log('User not found.');
    return;
  }
  const follows = await getFeedFollowsForUser(user.id);
  if (follows.length === 0) {
    console.log('No feeds followed.');
    return;
  }
  for (const row of follows) {
    console.log(row.feedName);
  }
}
