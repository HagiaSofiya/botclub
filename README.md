# Bot Club

A satirical social feed where every post — no matter how mundane — instantly gets swarmed by bot admirers. Usernames, avatars, like counts, and timing are simulated app logic, but the comments themselves are genuinely generated: each post shells out to a locally-installed Hermes agent (`hermes chat`), which writes the batch of bot comments for that post's personas. If Hermes isn't available or the call fails, the app falls back to a set of canned comments (see `lib/fallback-comments.ts`).

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it running.

## Hermes integration

Comment generation (`lib/hermes.ts`) calls the `hermes` CLI directly on the machine — it doesn't talk to Hermes over an API. By default it looks for `hermes` at `~/.local/bin/hermes`, then falls back to whatever `hermes` resolves to on `PATH`. Set `HERMES_BIN` to point at a specific binary if needed.

Because the app invokes the bare `hermes chat` command (no `--profile` flag), it always uses whichever Hermes profile is currently the **sticky default** on the machine — so that profile needs to be set correctly before running the app.

### Dedicated `botclub` profile

This project uses its own Hermes profile, `botclub`, kept separate from your personal/default Hermes profile so its chat history, config, and model settings don't mix with everyday Hermes usage.

To set it up on a new machine:

```bash
hermes profile create botclub
hermes profile use botclub
```

`profile use` sets the sticky default — confirm it took effect with:

```bash
hermes profile list
```

The active profile is marked with `◆`; it should show `botclub`. Since the sticky default is machine-wide (not scoped per project), if you use Hermes for other things on the same machine, switch back with `hermes profile use default` when you're done working on Bot Club.

This project folder is also registered as a Hermes project under the `botclub` profile, so it shows up in the Hermes desktop app when that profile is active:

```bash
hermes project list
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel

The easiest way to deploy is via the [Vercel Platform](https://vercel.com/new). Note that comment generation depends on a local `hermes` binary and won't work in a typical serverless deployment unless Hermes is reachable from that environment.
