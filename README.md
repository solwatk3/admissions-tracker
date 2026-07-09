# Admissions Tracker

A personal admissions counselor tool: dashboard, applicant tracker, applicant detail pages, and a message template library. Password-protected, deployed as a real website you can open from any device.

Stack: Next.js 14 (App Router) + Supabase (Postgres) + Vercel hosting.

## What's inside

- **Dashboard** (`/`) — counts by stage, overdue follow-ups, follow-ups due in the next 2 days
- **Applicant Tracker** (`/tracker`) — searchable/filterable table of every applicant
- **Applicant Detail** (`/applicant/[id]`) — edit info, log contact, set next follow-up date
- **Templates** (`/templates`) — reusable outreach copy per stage, copy-to-clipboard
- Simple shared-password login gate (no user accounts, one password for you)

## One-time setup (about 15 minutes)

### 1. Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and sign up / log in.
2. Click **New project**. Pick any name and a database password (save it somewhere).
3. Once it's created, go to **SQL Editor** → **New query**, paste in the contents of `supabase/schema.sql` from this project, and run it. This creates your `applicants`, `contact_log`, and `templates` tables and seeds five starter templates.
4. Go to **Project Settings → API**. You'll need two values from here in step 3 below:
   - **Project URL**
   - **anon public** key

### 2. Push this project to GitHub

1. Create a new empty repository on [github.com](https://github.com/new) (e.g. `admissions-tracker`). Don't initialize it with a README.
2. On your computer, open a terminal in this folder (`admissions-app`) and run:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/admissions-tracker.git
   git push -u origin main
   ```
   (Replace the URL with your repo's URL — GitHub shows you this after creating the repo.)

### 3. Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up / log in with your GitHub account.
2. Click **Add New → Project**, select the `admissions-tracker` repo you just pushed.
3. Before deploying, expand **Environment Variables** and add:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon public key |
   | `APP_PASSWORD` | any password you want to use to log in |
   | `COOKIE_SECRET` | any long random string (e.g. mash your keyboard for 40 characters) |
4. Click **Deploy**. In about a minute you'll get a live URL like `admissions-tracker.vercel.app` — open it, log in with your `APP_PASSWORD`, and you're in.

That URL works from your phone, laptop, anywhere — bookmark it.

### Making changes later

Any time you want to change how the app looks or behaves, edit the code and:
```
git add .
git commit -m "describe your change"
git push
```
Vercel automatically redeploys within about a minute of every push.

## Local development (optional)

If you want to run it on your own machine before/instead of deploying:
```
npm install
cp .env.local.example .env.local
```
Then fill in `.env.local` with the same four values from step 3 above, and run:
```
npm run dev
```
Visit `http://localhost:3000`.

## Notes

- Data lives in Supabase (Postgres), not in this folder — safe to move/copy this codebase around without losing applicant data.
- The password gate is a single shared password (set via `APP_PASSWORD`), not individual logins. Fine for personal use; don't share the password.
- To add more templates or edit the starter ones, do it right in the Templates page in the app — no code changes needed.
