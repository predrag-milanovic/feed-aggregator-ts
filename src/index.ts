// Import command registry types and helpers for CLI
import {
  CommandsRegistry,
  registerCommand,
  runCommand,
} from "./commands/commands";
// Import user-related command handlers
import {
  handlerListUsers,
  handlerLogin,
  handlerRegister,
} from "./commands/users";
// Import other command handlers and middleware
import { handlerReset } from "./commands/reset";
import { handlerAgg } from "./commands/aggregate";
import { handlerAddFeed, handlerListFeeds } from "./commands/feeds";
import { middlewareLoggedIn } from "./commands/middleware";
import { follow, following } from "./commands/feed-follows";

// Main entry point for CLI
async function main() {
  // Parse CLI arguments (skip node and script name)
  const args = process.argv.slice(2);

  // Show usage and exit if no command is provided
  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  // Extract command name and arguments
  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  // Initialize command registry
  const commandsRegistry: CommandsRegistry = {};

  // Register all supported CLI commands and their handlers
  registerCommand(commandsRegistry, "login", handlerLogin);       // Switch user
  registerCommand(commandsRegistry, "register", handlerRegister); // Create user
  registerCommand(commandsRegistry, "reset", handlerReset);       // Reset DB
  registerCommand(commandsRegistry, "users", handlerListUsers);   // List users
  registerCommand(commandsRegistry, "agg", handlerAgg);           // RSS aggregation
  registerCommand(commandsRegistry, "addfeed", middlewareLoggedIn(handlerAddFeed)); // Add feed (requires user)
  registerCommand(commandsRegistry, "feeds", handlerListFeeds);   // List feeds
  // Register follow command (requires feed URL)
  registerCommand(commandsRegistry, "follow", async (_cmd, url) => {
    if (!url) {
      console.log("usage: follow <url>");
      return;
    }
    await follow(_cmd, url);
  });
  // Register following command (lists followed feeds)
  registerCommand(commandsRegistry, "following", async (_cmd) => {
    await following(_cmd);
  });
  // Register unfollow command (requires logged-in user)
  const { handlerUnfollow } = await import("./commands/unfollow");
  registerCommand(commandsRegistry, "unfollow", middlewareLoggedIn(handlerUnfollow));
  
  // Register browse command (requires logged-in user)
  const { handlerBrowse } = await import("./commands/browse");
  registerCommand(commandsRegistry, "browse", middlewareLoggedIn(handlerBrowse));

  // Run the requested command and handle errors
  try {
    await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

// Start CLI
main();
