// Defines the signature for all command handlers - takes command name and variable arguments
export type CommandHandler = (cmdName: string, ...args: string[]) => void;

// Registry maps command names to their handler functions using Record utility type
export type CommandsRegistry = Record<string, CommandHandler>;

// Registers a new command in the registry - this enables extensible CLI architecture
export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

// Executes a command by looking it up in the registry and calling its handler
export function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): void {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  handler(cmdName, ...args);
}
