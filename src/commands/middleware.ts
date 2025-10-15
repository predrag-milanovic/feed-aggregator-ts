// Import function to read app config (for current user info)
import { readConfig } from "../config";
// Import DB query to fetch user by name
import { getUser } from "../lib/db/queries/users";
// Import User type for type safety
import { User } from "../lib/db/schema";

// Type for command handlers that require a logged-in user
export type UserCommandHandler = (
  cmdName: string, // CLI command name
  user: User,      // Authenticated user object
  ...args: string[] // Additional CLI arguments
) => Promise<void>;

// Middleware to ensure a user is logged in before running a command
export function middlewareLoggedIn(handler: UserCommandHandler) {
  // Returns a CommandHandler that checks for logged-in user
  return async (cmdName: string, ...args: string[]) => {
    // Read config to get current user name
    const config = readConfig();
    const userName = config.currentUserName;
    // If no user is logged in, throw error
    if (!userName) {
      throw new Error("No user logged in.");
    }
    // Fetch user from DB
    const user = await getUser(userName);
    // If user not found, throw error
    if (!user) {
      throw new Error(`User ${userName} not found`);
    }
    // Call the wrapped handler with user injected
    return handler(cmdName, user, ...args);
  };
}