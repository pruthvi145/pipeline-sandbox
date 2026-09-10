# pipeline-sandbox

Throwaway CI/CD test app. Not a product - exists to test the totalfamily/app
release/promote/rollback pipeline in isolation before those changes merge.

**Scope note:** this sandbox tests **app-code-only rollback** (matching
totalfamily/app PR #1670). The database-restore feature (PR #1684) was
cancelled by the business - `db_action: restore` is an intentional stub that
fails with a clear message, same as the real PR #1670 branch.

## Setup

### 1. Vercel

```bash
npm install -g vercel
vercel login                      # opens a browser, log into your NEW personal Hobby account
cd /Users/d.v.pandya/Projects/pipeline-sandbox
vercel link                       # "Set up and deploy?" -> yes; creates a new project, name it pipeline-sandbox
cat .vercel/project.json          # note "projectId" and "orgId" - you likely won't need these directly
vercel whoami                     # this is your VERCEL_SCOPE (your username)
```

Get a token: Vercel dashboard -> Settings -> Tokens -> Create Token, scoped to your **full account** (not a specific project - a project-scoped token can't do the team lookups `vercel link` needs), no expiry or 1 year -> copy it. This is `VERCEL_TOKEN`.

**Also required** - `vercel pull` (used by the deploy action) reads env vars from Vercel's own project config, NOT from GitHub secrets. Set these in the Vercel dashboard -> your `pipeline-sandbox` project -> Settings -> Environment Variables -> add for **both Production and Preview** (values from step 2 below):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Note: this sandbox's workflows only ever deploy to Vercel's built-in `production`/`preview` targets (never a custom "testing" environment) - Vercel's custom named environments require a paid Pro/Enterprise plan and aren't available on Hobby, so this setup deliberately avoids needing one.

### 2. Supabase (your existing free-tier project)

Supabase dashboard for your project:
- Settings -> General -> **Reference ID** -> this is `SUPABASE_PROJECT_ID`
- Settings -> Database -> **Database password** (the one you set at project creation - reset it there if you don't have it) -> this is `SUPABASE_DB_PASSWORD`
- Account (top-right avatar) -> Access Tokens -> Generate new token -> this is `SUPABASE_ACCESS_TOKEN`
- Settings -> API -> **Project URL** -> this is `NEXT_PUBLIC_SUPABASE_URL`
- Settings -> API -> **anon public** key -> this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Network Restrictions decision:** this project has them ON (confirmed - a local `supabase db push` attempt hit `EADDRNOTALLOWED`). Keeping them on is the more faithful test, since it's what exercises `migrate-supabase`'s open/close migration-window steps for real. That means:

- Skip running `supabase db push` locally - no need. `promote-to-production.yaml` runs `run-migration: true`, so the first CI deploy (step 4 below) applies the initial migration itself, opening its own network window to do it.
- Set a real `SUPABASE_BASELINE_CIDRS` value in step 3 below (not blank) - the CIDR the allow-list gets restored to once a CI run finishes. Your own current IP works well as this baseline (e.g. `<your-ip>/32`) - gives you standing local `psql`/dashboard access between CI runs, while CI temporarily widens it during each migrate and narrows it back after.

### 3. GitHub - wire secrets and variables

Repo-level:

```bash
cd /Users/d.v.pandya/Projects/pipeline-sandbox
gh secret set VERCEL_TOKEN --body "<value>"

gh variable set VERCEL_SCOPE --body "<your-vercel-username>"
gh variable set VERCEL_PROJECT --body "pipeline-sandbox"
gh variable set PROD_ALIAS --body ""                    # leave blank to use Vercel's auto *.vercel.app alias
```

Environment-scoped (`production` AND `testing` both need these - the two environments already exist on the repo):

```bash
for ENV in production testing; do
  gh secret set SUPABASE_PROJECT_ID    --env "$ENV" --body "<value>"
  gh secret set SUPABASE_ACCESS_TOKEN  --env "$ENV" --body "<value>"
  gh secret set SUPABASE_DB_PASSWORD   --env "$ENV" --body "<value>"
  gh variable set SUPABASE_BASELINE_CIDRS --env "$ENV" --body "<your-ip>/32"   # your current IP, e.g. 103.241.225.245/32
done
```

(This sandbox uses ONE real Supabase project for both `production` and `testing` environment secrets, since you only have one. That's fine here - the two GitHub Environments still exist to prove `rollback.yaml`'s `environment: production` binding works, which was one of the real bugs found in totalfamily/app.)

### 4. Prove the pipeline, in order

**a. Real release-please flow** (this is the actual TF flow, not a shortcut - push a conventional commit to main, release-please opens a Release PR, merging it tags + releases + deploys to demo):

```bash
git commit --allow-empty -m "feat: seed the first sandbox release"
git push origin main
```

- Watch `release-please.yaml` run (`gh run watch`) - it opens a PR titled something like "chore(main): release 0.2.0".
- **Merge that PR yourself in the GitHub UI** (or `gh pr merge --squash`) - this step must be a real merge, not automated, since a bot-token merge wouldn't trigger the next workflow run (GitHub doesn't chain workflow runs off its own default token's actions - see the note in `release-please.yaml`).
- That merge push re-triggers `release-please.yaml`, which now creates the tag + GitHub Release and deploys it to demo (Vercel Preview). Check the job summary for the deployment URL - confirm the todo app loads and you can add/complete/delete a todo.
- Note the tag it created (e.g. `v0.2.0`) - that's what you promote to production next:

```bash
gh workflow run promote-to-production.yaml -f tag=v0.2.0
gh run watch
```

**b. A second release, crossing a dummy migration already in this repo** (add a `feat:`/`fix:` commit touching anything, or another empty one):

```bash
git commit --allow-empty -m "fix: exercise a second sandbox release"
git push origin main
```

Repeat the same merge-the-Release-PR step, then promote the new tag the same way as above.

**c. Rollback dry run** (safe - resolves the target and checks the migration gate, deploys nothing):

```bash
gh workflow run rollback.yaml -f dry_run=true
gh run watch
```

Check the job summary - it should report your latest tag -> the previous one, and how many migrations were crossed.

**d. Real rollback with `db_action: proceed`** (deploys the previous tag's code against the current schema, no DB changes - safe, additive migrations only):

```bash
gh workflow run rollback.yaml -f db_action=proceed
gh run watch
```

This is as far as rollback goes in this sandbox. If a migration boundary is crossed and you try `db_action: restore`, the gate deliberately fails with "not implemented" - matching the real PR #1670 branch exactly, since the database-restore feature (PR #1684) was cancelled.

## What's deliberately NOT included

- **Database restore (`db_action: restore`)** - cancelled feature (was PR #1684). The stub fails on purpose with a clear message. Only `proceed` (additive-only migrations) and no-boundary rollbacks actually deploy.
- **release-please.yaml is included**, adapted: `vercel-environment` is `preview` instead of `testing` (Vercel's custom named environments need a paid Pro/Enterprise plan, unavailable on this sandbox's Hobby account), no GitHub App bot token (uses the workflow's own `GITHUB_TOKEN` - required enabling "Allow GitHub Actions to create and approve pull requests" in Settings -> Actions -> General, already done), and the E2E/Allure/Slack/Jira-linking jobs are dropped (no test suite, no webhook, no Jira convention here). One real behavioral difference to expect: because it uses the default `GITHUB_TOKEN`, GitHub won't auto-chain a workflow run off of that token's own actions - so **you must manually merge the Release PR** (GitHub UI or `gh pr merge`) for the tag/release/demo-deploy step to fire. This matches the real flow's expectation anyway (a human reviews and merges the release PR).
- **hotfix-release.yaml / hotfix-siding.yaml** - out of scope for this round; add later if needed.
- **Slack notifications** - removed entirely, no webhook dependency.
- **GitHub App bot token** - `mark-stable` steps use the workflow's own `GITHUB_TOKEN` instead.
- **E2E tests** - no Playwright suite; this sandbox is CI-pipeline-shaped, not product-shaped.
