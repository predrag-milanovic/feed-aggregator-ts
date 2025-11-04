# feed-aggregator-ts

## ℹ️ About

The Blog Aggregator is a type-safe [RSS](https://en.wikipedia.org/wiki/RSS) feed aggregator built with TypeScript and a [PostgreSQL](https://www.postgresql.org/) database.
It functions as a CLI tool that runs continuously in the background, fetching the latest content from your favorite blogs, news sites, and podcasts.
By storing all posts in a central database, it provides a fast, terminal-based interface for catching up on updates without the need for a browser or a third-party service.
It's a hands-on project designed for backend integration, database management, and long-running processes in a Node.js environment.

## 🔍 Overview

The application consists of two core components working together:

- A **long-running background service** that continuously polls subscribed [RSS](https://en.wikipedia.org/wiki/RSS) feeds for new content and stores it in a PostgreSQL database.
- A **CLI** for interacting with the aggregated data, allowing you to manage feeds and read your personalized content stream.

## ✨ Key Features

- **Subscribe to Content**: Add [RSS](https://en.wikipedia.org/wiki/RSS) feeds from across the internet to your personal collection.
- **Continuous Aggregation**: Long-running background service that automatically fetches and stores new posts from subscribed feeds.
- **Persistent Storage**: All posts are stored efficiently in a PostgreSQL database with deduplication and metadata preservation.
- **Social Curation**: Follow and unfollow RSS feeds that other users of the application have discovered.
- **Terminal-Based Reading**: Browse your personalized feed of posts directly in the terminal with configurable limits.
- **Smart Scheduling**: Feeds are fetched in rotation based on when they were last updated, ensuring fair distribution.
- **Type-Safe Database Interactions**: Leverages [Drizzle ORM](https://orm.drizzle.team/docs/overview) for robust and safe SQL queries and migrations.
- **Middleware Architecture**: Centralized user authentication and validation for protected commands.

## 💻 Install

### NVM

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

### PostgreSQL

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

### RSS

The whole point of the `feed-aggegator-ts` program is to fetch the [RSS](https://en.wikipedia.org/wiki/RSS) feed of a website and store its content in a structured format in our database. That way we can display it nicely in the CLI.
RSS is a specific structure of [XML](https://en.wikipedia.org/wiki/XML), but we will keep it simple and only worry about a few fields.

Here's an example of the documents we'll parse:

```bash
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
<channel>
  <title>RSS Feed Example</title>
  <link>https://www.example.com</link>
  <description>This is an example RSS feed</description>
  <item>
    <title>First Article</title>
    <link>https://www.example.com/article1</link>
    <description>This is the content of the first article.</description>
    <pubDate>Mon, 06 Sep 2021 12:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Second Article</title>
    <link>https://www.example.com/article2</link>
    <description>Here's the content of the second article.</description>
    <pubDate>Tue, 07 Sep 2021 14:30:00 GMT</pubDate>
  </item>
</channel>
</rss>
```

Then we can parse this kind of document into a JavaScript objects like this:

```bash
type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};
```

If the program were running in a browser, you could use the built-in [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) API, but since it's in Node.js, we'll use [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser/) instead:

```bash
# Install the fast-xml-parser package
npm i fast-xml-parser
```

## 🚀 Quick Start

### Configuration Setup
Create a config file at `~/.gatorconfig.json` in your home directory:

```json
{
  "db_url": "postgresql://username:password@localhost:5432/your_database?sslmode=disable",
  "current_user_name": ""
}
```

### Database Migration
Run the migrations to set up your database:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Basic Usage

```bash
# 1. User Management
npm run start register yourusername
npm run start login yourusername

# 2. Add RSS feeds to your collection
npm run start addfeed "TechCrunch" "https://techcrunch.com/feed/"
npm run start addfeed "Hacker News" "https://news.ycombinator.com/rss"
npm run start addfeed "Boot.dev Blog" "https://blog.boot.dev/index.xml"

# 3. Start continuous RSS aggregation (in one terminal)
npm run start agg 30s  # Fetch feeds every 30 seconds

# 4. Browse your collected posts (in another terminal)
npm run start browse      # Shows 2 posts by default
npm run start browse 10   # Shows 10 posts

# 5. Manage feed subscriptions
npm run start following   # See what you're following
npm run start follow "https://example.com/feed"
npm run start unfollow "https://example.com/feed"
```

## ⌨️ Available Commands

### User Management
- `register <username>` - Create a new user account
- `login <username>` - Switch to an existing user
- `users` - List all users with current user indication
- `reset` - Clear all users and feeds (development only)

### Feed Management
- `addfeed <name> <url>` - Add a new RSS feed to your collection (requires logged-in user)
- `feeds` - List all feeds in the system
- `follow <url>` - Follow an RSS feed by URL (requires logged-in user)
- `unfollow <url>` - Unfollow an RSS feed by URL (requires logged-in user)
- `following` - List all feeds the current user is following

### RSS Aggregation & Browsing
- `agg <time_between_reqs>` - Start continuous RSS feed aggregation (e.g., `agg 30s`, `agg 5m`)
- `browse [limit]` - Browse latest posts from followed feeds (default limit: 2)

## 🗃️ Database Schema

### Users Table
- `id` (UUID) - Primary key with random default
- `created_at` (TIMESTAMP) - Auto-set on creation
- `updated_at` (TIMESTAMP) - Auto-updated on changes
- `name` (TEXT) - Unique username

### Feeds Table
- `id` (UUID) - Primary key with random default
- `created_at` (TIMESTAMP) - Auto-set on creation
- `updated_at` (TIMESTAMP) - Auto-updated on changes
- `name` (TEXT) - Feed display name
- `url` (TEXT) - Unique RSS feed URL
- `user_id` (UUID) - Foreign key to users with ON DELETE CASCADE

### Feed Follows Table
- `id` (UUID) - Primary key with random default
- `created_at` (TIMESTAMP) - Auto-set on creation
- `updated_at` (TIMESTAMP) - Auto-updated on changes
- `user_id` (UUID) - Foreign key to users
- `feed_id` (UUID) - Foreign key to feeds
- Unique constraint on (`user_id`, `feed_id`)

### Posts Table
- `id` (UUID) - Primary key with random default
- `created_at` (TIMESTAMP) - Auto-set on creation
- `updated_at` (TIMESTAMP) - Auto-updated on changes
- `title` (TEXT) - Post title (required)
- `url` (TEXT) - Post URL (unique, required)
- `description` (TEXT) - Post content/description (nullable)
- `published_at` (TIMESTAMP) - When the post was published (nullable)
- `feed_id` (UUID) - Foreign key to feeds with ON DELETE CASCADE

##  Typical Workflow

1. **Setup**: Create config file, run migrations, register/login as a user
2. **Add Feeds**: Use `addfeed` to add RSS feeds to your collection
3. **Start Aggregation**: Run `agg 30s` in one terminal to continuously fetch posts
4. **Browse Posts**: Use `browse` in another terminal to read your collected posts
5. **Manage Subscriptions**: Follow/unfollow feeds as needed with `follow`/`unfollow`

##  Development

The project uses a modular architecture with separate concerns:

- `src/commands/` - CLI command handlers and middleware for user validation
- `src/lib/db/` - Database schema, queries, and migrations
- `src/lib/rss.ts` - RSS feed parsing functionality
- `src/lib/utils.ts` - Utility functions (duration parsing, RSS date parsing)
- `src/config.ts` - Configuration management

**Key Features:**
- **Type-safe Database Operations**: All queries use Drizzle ORM for compile-time safety
- **Middleware Pattern**: User authentication handled centrally for protected commands
- **RSS Date Parsing**: Robust parsing of various RSS date formats (RFC 2822, ISO 8601)
- **Duplicate Prevention**: Posts are deduplicated by URL to avoid storing duplicates
- **Graceful Shutdown**: Aggregator handles Ctrl+C for clean process termination

