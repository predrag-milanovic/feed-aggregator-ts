import {
  CommandsRegistry,
  registerCommand,
  runCommand,
} from "./commands/commands";
import { handlerLogin, handlerRegister } from "./commands/users";

async function main() {
  const args = process.argv.slice(2);   // Isolates user-provided arguments

  // CLI must have at least a command name
  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];    // First argument is the command
  const cmdArgs = args.slice(1);    // Remaining arguments are passed to command handler
  const commandsRegistry: CommandsRegistry = {};

  // Register available commands - this is where new commands would be added
  registerCommand(commandsRegistry, "login", handlerLogin);
  registerCommand(commandsRegistry, "register", handlerRegister);

  try {
    // Execute the requested command with its arguments
    await runCommand(commandsRegistry, cmdName, ...cmdArgs);
  } catch (err) {
    // Handle both Error objects and other thrown values
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);    // Exit with error code for script failure
  }
  process.exit(0);
}

main();
