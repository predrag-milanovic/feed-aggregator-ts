# feed-aggregator-ts

## ℹ️ About

The Blog Aggregator is a type-safe [RSS](https://en.wikipedia.org/wiki/RSS) feed aggregator built with TypeScript and a [PostgreSQL](https://www.postgresql.org/) database.
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

We'll use a single [JSON](https://www.json.org/json-en.html) file to keep track of two things:
- Who is currently logged in,
- The connection credentials for the PostgreSQL database.

Postgres, like most other database technologies, is itself a server.
It listens for requests on a port (Postgres' default is `:5432`), and responds to those requests.
To interact with Postgres, first you will install the server and start it. Then, you can connect to it using a client like [psql](https://www.postgresql.org/docs/current/app-psql.html#:~:text=psql%20is%20a%20terminal%2Dbased,or%20from%20command%20line%20arguments.) or [PGAdmin](https://www.pgadmin.org/).

[Install](https://learn.microsoft.com/en-us/windows/wsl/tutorials/wsl-database#install-postgresql) Postgres:
```bash
# Linux / WSL (Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib
```

```bash
# Ensure the installation worked
psql --version
```

```bash
# Update postgres password
sudo passwd postgres
```

```bash
# Start the Postgres server in the background
sudo service postgresql start
```

Connect to the server. I recommend simply using the `psql` client. It's the "default" client for Postgres, and it's a great way to interact with the database. While it's not as user-friendly as a GUI like [PGAdmin](https://www.pgadmin.org/), it's a great tool to be able to do at least basic operations with.

```bash
# Enter the psql shell
sudo -u postgres psql
```

Create and connect to the new database:

```bash
# Give the DATABASE a name
CREATE DATABASE DATABASE_NAME;
```

```bash
# Connect to the new database
\c DATABASE_NAME
```

[Here](https://www.postgresql.org/docs/current/app-psql.html) you can find all psql meta-commands.

[Drizzle](https://orm.drizzle.team/docs/overview) is a [ORM](https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping) and migration tool written in TypeScript and [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview) is a CLI tool that will help us run our migrations and the [Postgres driver](https://github.com/porsager/postgres) allows drizzle and our program to talk to the database.

```bash
# Install drizzle, postgres and drizzle-kit
npm i drizzle-orm postgres
npm i -D drizzle-kit
```

Get your connection string. A connection string is just a URL with all of the information needed to connect to a database.
Test your connection string by running `psql`, the format is:

```bash
protocol://username:password@host:port/database
# Add the connection string to the .gatorconfig.json file instead of the example string.
# The file should be in your home directory, ~/.gatorconfig.json.
```

When using it with `psql`, you'll use it in the format we just used.
However, here in the config file it needs an additional `sslmode=disable` query string:

```bash
protocol://username:password@host:port/database?sslmode=disable
# Your application code needs to know to not try to use SSL locally.
```

Run the `npx drizzle-kit` generate command to generate the migration files based on our current schema state.
These files are created in the directory you specified in the `out` field of `drizzle.config.ts`:

```bash
npx drizzle-kit generate
```

If everything looks like it should, run the migration:

```bash
npx drizzle-kit migrate
```
