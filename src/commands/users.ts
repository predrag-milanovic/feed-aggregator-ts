import { setUser, readConfig } from "../config";
import { createUser, getUser, getUsers } from "../lib/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  setUser(userName);

  console.log("User switched successfully!");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length != 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const existingUser = await getUser(userName);
  if (existingUser) {
    throw new Error(`User ${userName} already exists`);
  }

  const user = await createUser(userName);
  setUser(user.name);
  console.log("User created successfully!");
}

export async function handlerListUsers(_: string) {
  const users = await getUsers();
  const config = readConfig();

  for (let user of users) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
      continue;
    }
    console.log(`* ${user.name}`);
  }
}