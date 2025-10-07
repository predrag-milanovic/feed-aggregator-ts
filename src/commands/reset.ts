import { deleteAllUsers } from "../lib/db/queries/users";

export async function handlerReset(cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName}`);
  }

  await deleteAllUsers();
  console.log("Database reset successfully! All users deleted.");
  return;
}