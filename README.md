# Escapture

**Keep a record of what happened.**

Escapture helps university students dealing with cyberbullying on Facebook save reliable evidence, organize it into a case, and share it with their school's reviewers whenever they're ready.

**Live app:** [escapture-live.vercel.app](https://escapture-live.vercel.app)

<!-- DEMO VIDEO: add the link here, e.g. [Watch the 3-minute demo](https://...) -->

![The Escapture home page](docs/screenshots/home.png)

## Why Escapture?

Online posts can be edited or deleted in seconds, and regular screenshots are easy to fake—which makes it hard for schools to trust them. Students end up juggling screenshots in their camera roll and repeating their story over and over.

Escapture makes the process safer and clearer for everyone:

- **For students:** Use our Chrome extension to save a Facebook post or Messenger chat. Before saving, the extension checks that the page hasn't been tampered with in the browser. Your capture is stored in a private vault with a timestamp and a unique digital fingerprint (SHA-256 hash).
- **You stay in control:** Nothing is sent to the school until you decide to submit a case. You choose what evidence to include, who can help you build it, and when to send it.
- **For school reviewers:** Reviewers (like the Student Affairs Office) receive an organized case with a title, summary, and evidence marked _Captured with tamper checks_. They can review the evidence, attach responses from the other party, and record the final outcome.

Escapture supports your university's existing process—it doesn't replace it or decide who is right.

*Pilot version built for Bulacan State University (students sign up with their `@ms.bulsu.edu.ph` email).*

## What you can do

### Students

- **Save posts and chats safely:** Use the Chrome extension to capture a Facebook post or pick specific Messenger messages. If someone edited the page using browser tools or extensions, Escapture blocks the capture.
- **Private vault:** View your saved evidence safely without any active scripts running. Every item includes its capture time and digital fingerprint so it can be verified anytime.
- **Controlled sharing:** Share items with other Escapture users by email or via a password-protected link. You can see who has access and revoke it whenever you want.
- **Build cases together:** Group your evidence into a case with a title and description. You can invite trusted friends or witnesses to add their own evidence in real time.
- **Submit when ready:** Before sending a case to reviewers, you'll see an exact preview of what they will receive. Once submitted, the case is locked so nothing can be altered or deleted while it's open.
- **Track progress:** Follow your case from _Escalated_ to _Under Review_ to _Closed_, get in-app notifications, and read the reviewer's closing note.
- **Keep your privacy after closing:** Once a case is closed, reviewers lose access to your files. Only a basic record remains on the case, and you can rename or delete your evidence again.

### Reviewers

- **Overview dashboard:** See open case counts and weekly submission trends at a glance.
- **Review Board:** Browse all submitted cases in one place with search and filters (assigned to me, unassigned, has collaborators, has flagged words, or date range).
- **Flagged words:** Cases mentioning urgent terms (such as self-harm or threats in English or Filipino) are highlighted so reviewers can spot them quickly. Students never see these flags, and they don't automatically rank or judge a case.
- **Case review:** Inspect attached evidence, mark a case as under review, and close it with a summary of actions taken.
- **Include the other side:** Attach evidence shared by the other party (such as the accused student's full chat capture). These stay separate and hidden from the reporting student.
- **Case Archives:** Look up closed cases and their records anytime.

### Administrators

- **Manage reviewers:** Create reviewer accounts with a one-time setup link (so only they know their password), and activate or deactivate accounts as needed.
- **Assign cases:** Assign reviewers to specific cases and notify them, while still allowing any reviewer to step in.
- **Manage flagged words:** Add or remove words from the flag list—cases update automatically.
- **Full access:** Admins have all reviewer permissions as well.

### Built-in safety & privacy

- All permissions are enforced on the server, not just in the browser.
- Uploaded files are re-checked by the server; tampered uploads are rejected.
- Saved pages open in a strict, isolated viewer so they can never run harmful code.
- Database tables use row-level security, and sign-ins/APIs are rate-limited.
- Captures are honestly labeled as _tamper-checked_, never _tamper-proof_.

<!-- SCREENSHOT: vault with captured items -->
<!-- SCREENSHOT: extension popup and element picker on a Facebook post -->
<!-- SCREENSHOT: Review Board with flagged words -->

## Quick local setup

Run Escapture on your own computer with built-in demo accounts. No external cloud accounts are needed—files save directly to your machine.

### What you need

- **Node.js** 20.9 or newer
- **pnpm** 11 (`npm install -g pnpm`)
- **Docker Desktop** (running, for the local database)
- **Google Chrome** (for the extension)

### 1. Download and configure

```bash
git clone [https://github.com/shnflrsc/escapture.git](https://github.com/shnflrsc/escapture.git)
cd escapture
pnpm install
```

Copy the example environment file:

```bash
# macOS / Linux
cp .env.example .env.local

# Windows PowerShell
Copy-Item .env.example .env.local
```

Open `.env.local` and update these three lines (leave the rest as-is):

```env
DATABASE_URL=postgres://postgres:postgres@localhost:54329/safetrail
DIRECT_URL=postgres://postgres:postgres@localhost:54329/safetrail
BETTER_AUTH_SECRET=<paste-generated-secret-here>
```

Generate a random secret for `BETTER_AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 2. Start the app

```bash
pnpm db:local     # starts Postgres in Docker
pnpm db:migrate   # sets up database tables
pnpm db:seed      # creates demo accounts and sample data
pnpm dev          # starts the app at http://localhost:3000
```

`pnpm db:seed` will print the shared password for these demo accounts:

| Role                      | Email                                                  |
| ------------------------- | ------------------------------------------------------ |
| Administrator             | `admin@safetrail.test`                                 |
| Reviewer                  | `reviewer1@safetrail.test`, `reviewer2@safetrail.test` |
| Student (reporter)        | `maya.demo@ms.bulsu.edu.ph`                            |
| Student (collaborator)    | `jules.demo@ms.bulsu.edu.ph`                           |
| Student (the other party) | `alex.demo@ms.bulsu.edu.ph`                            |

Open [http://localhost:3000](http://localhost:3000) and sign in with any account above.

### 3. Install the Chrome extension

```bash
pnpm ext:build
```

This builds the extension pointing to `http://localhost:3000` with a fixed ID (`idlfmehfilgnnlgpiokgpanpjdfnejnd`) that's already trusted by `.env.example`.

1. Open `chrome://extensions` in Chrome and turn on **Developer mode** (top right).
2. Click **Load unpacked** and select the `extension/dist` folder.
3. Pin **Escapture** to your toolbar, open it, and sign in with a student account (like Maya).

### 4. Try capturing evidence

The extension works on `facebook.com` and `messenger.com`.

1. **Refresh your Facebook tab** after installing the extension so the tamper guard can start watching the page.
2. Open a post or Messenger chat, click the Escapture icon, and select **Capture this page**.
3. **For a post:** Click anywhere on the post. Adjust the selection with **Wider** or **Narrower**, then click **Capture this post**.
4. **For messages:** Click the messages you want (hold Shift to select a range) or click **Select all loaded messages**, then hit **Capture**. *(Scroll up first if you need older messages.)*
5. View your saved capture at [http://localhost:3000/vault](http://localhost:3000/vault).

> **No Facebook account?** Run `pnpm fixtures:serve` and test on our sample pages:  
> [http://localhost:4100/fake-facebook-post.html](http://localhost:4100/fake-facebook-post.html) or [http://localhost:4100/fake-messenger.html](http://localhost:4100/fake-messenger.html)
>
> **Want to test the tamper check?** Right-click the post text, click **Inspect**, change the text in DevTools, and try capturing—Escapture will block it.

### Try the full workflow

1. Sign in as **Maya**, create a case from the vault, attach evidence, and add a description.
2. Click **Escalate**, check the preview, and confirm.
3. Sign in as **reviewer1** in another browser profile and open the case on the Review Board.
4. Click **Start review**, then **Close case** with a short closing note.
5. Switch back to **Maya** to see the _Closed_ status, notification, and closing note.

### Adding new accounts

Students can sign up at `/sign-up` using an `@ms.bulsu.edu.ph` email. Reviewers must be created by an admin on the **Reviewer accounts** page, or via the terminal:

```bash
pnpm admin:create-user --email someone@example.com --name "Full Name" --password "at-least-8-chars" --role reviewer
```

## Tech stack

- **Web app:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Database & storage:** PostgreSQL with Drizzle ORM (Supabase in production, Docker locally)
- **Authentication:** Better Auth (email/password + bearer tokens for the extension)
- **Validation:** Zod
- **Chrome extension:** Manifest V3 bundled with esbuild
- **Hosting:** Vercel
- **Testing:** Vitest + end-to-end API smoke test

## Running tests

```bash
pnpm typecheck   # check TypeScript types
pnpm lint        # run linter
pnpm test        # run unit tests
pnpm smoke       # run full end-to-end API test (requires `pnpm dev` running)
```

- **Unit tests** verify permissions, escalation previews, file hashing, link passwords, email domain rules, flagged-word matching, and API authentication guards.
- **Smoke test** simulates a full user journey from sign-up and evidence upload to case escalation, reviewer handling, closing, and notifications.

## Project structure

```text
app/
  (marketing)/     Home, Terms, Privacy Policy, Contact
  (auth)/          Sign in, Sign up
  (public)/        Shared links, Reviewer setup
  (app)/           Vault, Cases, Notifications, Review Board, Admin
  api/             API routes
server/
  authz.ts         Permission checks
  services/        Core business logic (evidence, sharing, cases, review, flags, notifications)
  db/              Database schema and client
  storage.ts       File storage (Supabase or local disk)
components/        Reusable UI components
extension/         Escapture Chrome extension
drizzle/           Database migrations
fixtures/          Sample Facebook/Messenger pages for testing
scripts/           Seed, user creation, and smoke test scripts
```

## Team

**Team Esgabture**

- **Hezekiah Christal Dionisio** — Team Lead: project direction, coordination, and core concept.
- **Darl Shanen Floresca** — Lead Developer: full-stack implementation and system architecture.
- **Kyle Acuña** — Front-End and UI/UX Designer: interface and experience design, and pitch video.
- **John Gabriel Gabon** — Front-End and UI/UX Designer: interface and experience design.
