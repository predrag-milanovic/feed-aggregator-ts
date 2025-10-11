import {
  CommandsRegistry,
  registerCommand,
  runCommand,
} from "./commands/commands";
import {
  handlerListUsers,
  handlerLogin,
  handlerRegister,
} from "./commands/users";
import { handlerReset } from "./commands/reset";
import { handlerAgg } from "./commands/aggregate";

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const cmdName = args[0];
  const cmdArgs = args.slice(1);
  const commandsRegistry: CommandsRegistry = {};

  registerCommand(commandsRegistry, "login", handlerLogin);
  registerCommand(commandsRegistry, "register", handlerRegister);
  registerCommand(commandsRegistry, "reset", handlerReset);
  registerCommand(commandsRegistry, "users", handlerListUsers);
  registerCommand(commandsRegistry, "agg", handlerAgg);

  try {
    await runCommand(commandsRegistry, cmdName, ...cmdArgs);
    process.exit(0);
  } catch (err) {
    if (err instanceof Error) {
      console.error(`Error running command ${cmdName}: ${err.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${err}`);
    }
    process.exit(1);
  }
}

main();