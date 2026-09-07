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

## Deploying to production

Vercel (or any serverless host) won't work as-is: `lib/hermes.ts` shells out to a `hermes` binary that has to be installed on the machine running the app, and it authenticates using whatever Hermes profile is the **sticky default in that machine's local Hermes config** — there's no env var carrying credentials, so there's nothing for a serverless platform to inject. Two problems follow from that:

1. **No persistent filesystem/binary.** Serverless functions spin up fresh containers with no installed `hermes` CLI and no `~/.local/bin` or Hermes config directory to resolve a profile from.
2. **Personal credentials, public traffic.** Even if you got `hermes` bundled into a deployment, the `botclub` profile documented above is tied to your own Hermes login. Every visitor's post would generate comments billed to *your* personal account with no isolation, no rate limit, and no way to revoke prod access without also breaking your local dev setup.

### Realistic path

- **Run on a persistent host, not serverless.** Something with a real, long-lived filesystem you control — a small VM or container service (Fly.io, Railway, a droplet/EC2 instance) running `npm run build && npm run start` continuously — so `hermes` can actually be installed and stay configured between requests.
- **Give production its own credential, not your personal one.** Hermes supports non-interactive credential injection via `hermes auth add <provider> --api-key <key>` (or `--type api-key` with `--no-browser` for OAuth where supported) — concrete enough to script into a container build. Create a dedicated credential for the provider you're using (e.g. an API key scoped to a project, or a separate OAuth app), add it into the production container's Hermes config with `hermes auth add`, then create a `botclub-prod` profile on top of it and set it as the sticky default inside that container only — same shape as the local `botclub` setup, just different auth on a different machine. That way prod usage bills separately, is isolated from your personal profile, and can be revoked by removing the credential without touching your dev setup. Run `hermes auth list` and `hermes profile show` inside the container to confirm which credential the profile is actually wired to before opening traffic to it.
- **Add abuse protection before opening it up.** Once a real credential is footing the bill for arbitrary public traffic, add a rate limit (per-IP or per-session) on `POST /api/posts` and/or a daily request/spend cap, so a viral post or bot traffic can't run up unbounded usage. `lib/fallback-comments.ts` already exists for when Hermes fails — leaning on it harder past a cap (serve canned comments once a threshold is hit, rather than always calling Hermes) is a cheap way to bound worst-case cost.
