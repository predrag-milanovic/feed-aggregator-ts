# feed-aggregator-ts

## ℹ️ About

The Blog Aggregator is a type-safe [RSS](https://en.wikipedia.org/wiki/RSS) feed aggregator built with TypeScript and a PostgreSQL database.
It functions as a CLI tool that runs continuously in the background, fetching the latest content from your favorite blogs, news sites, and podcasts.
By storing all posts in a central database, it provides a fast, terminal-based interface for catching up on updates without the need for a browser or a third-party service.
It's a hands-on project designed for backend integration, database management, and long-running processes in a Node.js environment.

## 🔍 Overview

The application consists of two core components working together:

- A **long-running background service** that continuously polls subscribed RSS feeds for new content and stores it in a PostgreSQL database.
- A **CLI** for interacting with the aggregated data, allowing you to manage feeds and read your personalized content stream.

## ✨ Key Features

- **Subscribe to Content**: Add RSS feeds from across the internet to your personal collection.
- **Persistent Storage**: All posts are stored efficiently in a PostgreSQL database for fast querying and offline access.
- **Social Curation**: Follow and unfollow RSS feeds that other users of the application have discovered.
- **Terminal-Based Reading**: View concise summaries of aggregated posts directly in your terminal, complete with links to the full content.
- **Type-Safe Database Interactions**: Leverages [Drizzle ORM](https://orm.drizzle.team/docs/overview) for robust and safe SQL queries and migrations.

## 💻 Install

Install [NVM](https://github.com/nvm-sh/nvm) (preferred way to manage Node.js versions in this Project).

Use one of the following URLs:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

After installing `nvm`, add a `.nvmrc` file to the root of your project directory that contains a snippet of text:

```bash
22.15.0
# This allows you to simply type `nvm use` in your CLI while in the root of your project to activate the correct version of node!
```

Check to make sure you've activated the correct version of `node` by typing:

```bash
node --version
# Prints: v22.15.0
```

After you checked the correct version of `node`, from the root of your repository, run `npm init -y` to create a new Node.js project.

Add **TypeScript** along with types for `node`, and [tsx (TypeScript Execute)](https://github.com/privatenumber/tsx) which will allow you to run TypeScript files directly in Node.js:

```bash
npm install -D typescript @types/node tsx
```

Configure **TypeScript** by creating a `tsconfig.json` file in the root of the project:

```bash
{
  "compilerOptions": {
    "baseUrl": ".",
    "target": "esnext",
    "module": "esnext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["./src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Configure the `package.json` in the root of the project:

- Add `"type":"module"`,
- Add a `start` script that runs `tsx ./src/index.ts`:

```bash
{
...
  "type": "module",
  "scripts": {
    "start": "tsx ./src/index.ts"
  },
...
}
```