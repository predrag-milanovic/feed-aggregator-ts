import { fetchFeed } from "../lib/rss";
import { getNextFeedToFetch, markFeedFetched } from "../lib/db/queries/feeds";
import { createPost } from "../lib/db/queries/posts";
import { parseDuration, parseRSSDate } from "../lib/utils";

async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  
  if (!feed) {
    console.log("No feeds found to fetch");
    return;
  }
  
  console.log(`Fetching feed: ${feed.name} (${feed.url})`);
  
  try {
    // Mark as fetched before attempting to fetch
    await markFeedFetched(feed.id);
    
    // Fetch the RSS feed
    const feedData = await fetchFeed(feed.url);
    
    // Handle case where items might be a single object instead of array
    const items = Array.isArray(feedData.channel.item) 
      ? feedData.channel.item 
      : [feedData.channel.item];
    
    console.log(`Found ${items.length} posts in ${feed.name}`);
    
    let savedCount = 0;
    let skippedCount = 0;
    
    // Save all posts to database
    for (const item of items) {
      const publishedAt = parseRSSDate(item.pubDate);
      
      const savedPost = await createPost(
        item.title,
        item.link,
        item.description,
        publishedAt,
        feed.id
      );
      
      if (savedPost) {
        savedCount++;
        console.log(`✓ Saved: ${item.title}`);
      } else {
        skippedCount++;
        console.log(`- Skipped (already exists): ${item.title}`);
      }
    }
    
    console.log(`Saved ${savedCount} new posts, skipped ${skippedCount} existing posts`);
    console.log("---");
    
  } catch (error) {
    console.error(`Failed to fetch feed ${feed.name}: ${error}`);
  }
}

function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(`Error in scrapeFeeds: ${error.message}`);
  } else {
    console.error(`Unknown error in scrapeFeeds: ${error}`);
  }
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }
  
  const durationStr = args[0];
  let timeBetweenRequests: number;
  
  try {
    timeBetweenRequests = parseDuration(durationStr);
  } catch (error) {
    throw new Error(`Invalid duration: ${durationStr}. Use format like 1s, 1m, 1h`);
  }
  
  // Convert milliseconds back to a readable format for the log message
  const seconds = Math.floor(timeBetweenRequests / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  let readableTime = "";
  if (hours > 0) {
    readableTime += `${hours}h`;
  }
  if (minutes % 60 > 0) {
    readableTime += `${minutes % 60}m`;
  }
  if (seconds % 60 > 0) {
    readableTime += `${seconds % 60}s`;
  }
  if (readableTime === "") {
    readableTime = `${timeBetweenRequests}ms`;
  }
  
  console.log(`Collecting feeds every ${readableTime}`);
  
  // Start scraping immediately
  scrapeFeeds().catch(handleError);
  
  // Set up interval for continuous scraping
  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);
  
  // Handle graceful shutdown
  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("\nShutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}
