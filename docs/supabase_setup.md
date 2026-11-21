# Supabase Setup Guide for LearnLens

Follow these simple steps to set up your free Supabase database for the hackathon.

---

### Step 1: Create a Free Project in Supabase
1. Log in to [https://supabase.com](https://supabase.com).
2. Click **"New project"** and select your organization.
3. Name your project: `learnlens` (or any name you prefer).
4. Set a strong database password (save it somewhere safe).
5. Choose the closest region (e.g. `South Asia (Mumbai)` or nearest to you).
6. Click **"Create new project"** (it takes about 1-2 minutes to provision).

---

### Step 2: Execute Schema & Seed Data
1. In the left navigation menu of your Supabase dashboard, click **"SQL Editor"** (the icon looks like `>_` or terminal/table).
2. Click **"New query"**.
3. Open `database/schema.sql` in your IDE, copy its **entire content**, paste it into the Supabase SQL Editor, and click **"Run"** (green button).
   * *You should see: "Success. No rows returned."*
4. Click **"New query"** again.
5. Open `database/seed.sql` in your IDE, copy its **entire content**, paste it into the SQL Editor, and click **"Run"**.
   * *You should see: "Success. No rows returned."*
6. In the left sidebar, click **"Table Editor"** and verify that your tables (`profiles`, `topics`, `questions`, `quizzes`, `learning_gaps`, etc.) are now populated with demo data!

---

### Step 3: Get Your API Credentials (Put in `.env` ONLY)
1. In the left sidebar, click **"Project Settings"** (the gear icon at the bottom).
2. Under "Configuration", click **"Data API"** (or **"API"**).
3. Find:
   * **Project URL**: (e.g., `https://xyzcompany.supabase.co`)
   * **Project API keys**: Copy the **`anon` / `public`** key (starts with `ey...`).
4. In your project root, copy `.env.example` to `.env`:
   ```cmd
   copy .env.example .env
   ```
5. Open `.env` in your editor and paste:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   ```
6. **IMPORTANT:** Never paste these keys in chat, GitHub, or any public place! `.gitignore` already protects your `.env`.
