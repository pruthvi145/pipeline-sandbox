# pipeline-sandbox

Throwaway CI/CD test app. Not a product - exists to test the totalfamily/app
release/promote/rollback pipeline in isolation before those changes merge.

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

Get a token: Vercel dashboard -> Settings -> Tokens -> Create Token (no expiry, or 1 year) -> copy it. This is `VERCEL_TOKEN`.

**Also required** - `vercel pull` (used by the deploy action) reads env vars from Vercel's own project config, NOT from GitHub secrets. Set these in the Vercel dashboard -> your `pipeline-sandbox` project -> Settings -> Environment Variables -> add for the **Production** environment (values from step 2 below):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Note: this sandbox's workflows only ever deploy to Vercel's built-in `production` target (never a custom "testing" environment) - Vercel's custom named environments require a paid Pro/Enterprise plan and aren't available on Hobby, so this setup deliberately avoids needing one.

### 2. Supabase (your existing free-tier project)

Supabase dashboard for your project:
- Settings -> General -> **Reference ID** -> this is `SUPABASE_PROJECT_ID`
- Settings -> Database -> **Database password** (the one you set at project creation - reset it there if you don't have it) -> this is `SUPABASE_DB_PASSWORD`
- Account (top-right avatar) -> Access Tokens -> Generate new token -> this is `SUPABASE_ACCESS_TOKEN`
- Settings -> API -> **Project URL** -> this is `NEXT_PUBLIC_SUPABASE_URL`
- Settings -> API -> **anon public** key -> this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Network Restrictions decision:** this project has them ON (confirmed - a local `supabase db push` attempt hit `EADDRNOTALLOWED`). Keeping them on is actually the more faithful test, since it's what exercises `open-db-network-window`/`close-db-network-window` for real - so we're keeping them on rather than disabling them. That means:

- Skip running `supabase db push` locally - no need. `promote-to-production.yaml` runs `run-migration: true`, so the first CI deploy (step 5a below) applies the initial migration itself, opening its own network window to do it.
- Set `MANAGE_NETWORK_WINDOW=true` and a real `SUPABASE_BASELINE_CIDRS` value in step 4 below (not the placeholder-blank shown there) - the CIDR the allow-list gets restored to once a CI run finishes. Your own current IP works well as this baseline (e.g. `<your-ip>/32`) - gives you standing local `psql`/dashboard access between CI runs, while CI temporarily widens it during each migrate/restore and narrows it back after. No manual dashboard IP-adding needed - `open-db-network-window` authenticates via `SUPABASE_ACCESS_TOKEN` through Supabase's management API, which isn't subject to the Postgres-level restriction itself.

### 3. Cloudflare R2 (for the snapshot/restore path)

1. Sign up free at https://dash.cloudflare.com/sign-up if you don't have an account.
2. R2 -> Create bucket -> name it `pipeline-sandbox-db-backups`. This is `R2_DB_BACKUP_BUCKET`.
3. Your Cloudflare **Account ID** is on the R2 overview page, right side. This is `R2_ACCOUNT_ID`.
4. R2 -> Manage API Tokens -> Create API Token -> permissions: Object Read & Write, scoped to the bucket above -> Create. Copy the **Access Key ID** (`R2_DB_BACKUP_ACCESS_KEY_ID`) and **Secret Access Key** (`R2_DB_BACKUP_SECRET_ACCESS_KEY`) - the secret is shown once.

### 4. GitHub - wire secrets and variables

Repo-level (not environment-scoped - matches how R2 creds are set up in totalfamily/app):

```bash
cd /Users/d.v.pandya/Projects/pipeline-sandbox
gh secret set R2_ACCOUNT_ID --body "<value>"
gh secret set R2_DB_BACKUP_BUCKET --body "pipeline-sandbox-db-backups"
gh secret set R2_DB_BACKUP_ACCESS_KEY_ID --body "<value>"
gh secret set R2_DB_BACKUP_SECRET_ACCESS_KEY --body "<value>"
gh secret set VERCEL_TOKEN --body "<value>"

gh variable set VERCEL_SCOPE --body "<your-vercel-username>"
gh variable set VERCEL_PROJECT --body "pipeline-sandbox"
gh variable set PROD_ALIAS --body ""                    # leave blank to use Vercel's auto *.vercel.app alias
gh variable set MANAGE_NETWORK_WINDOW --body "true"      # this project has Network Restrictions on - see note above
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

### 5. Prove the pipeline, in order

**a. Normal deploy + first release** (creates the app's first Vercel deployment and a v1.0.0 pre-release):

```bash
gh api repos/pruthvi145/pipeline-sandbox/releases -X POST \
  -f tag_name=v1.0.0 -f target_commitish=main -F prerelease=true -f name=v1.0.0
gh workflow run promote-to-production.yaml -f tag=v1.0.0
gh run watch
```

Check the deployment URL in the run's job summary - confirm the todo app actually loads and you can add/complete/delete a todo.

**b. A second release, crossing the two dummy migrations already in this repo:**

```bash
gh api repos/pruthvi145/pipeline-sandbox/releases -X POST \
  -f tag_name=v1.1.0 -f target_commitish=main -F prerelease=true -f name=v1.1.0
gh workflow run promote-to-production.yaml -f tag=v1.1.0
gh run watch
```

**c. Rollback dry run** (safe - resolves the target and checks the migration gate, deploys nothing):

```bash
gh workflow run rollback.yaml -f dry_run=true
gh run watch
```

Check the job summary - it should report v1.1.0 -> v1.0.0 with 2 migrations crossed (the priority column + its index).

**d. Real rollback with `db_action: proceed`** (deploys v1.0.0's code against the current schema, no DB changes - safe, additive migrations only):

```bash
gh workflow run rollback.yaml -f db_action=proceed
gh run watch
```

**e. Real rollback with `db_action: restore`** (the big one - actually drops and restores the schema):

```bash
gh workflow run rollback.yaml -f db_action=restore -f confirm_restore=CONFIRM
gh run watch
```

Verify afterward: the `priority` column and its index should be gone (`\d todos` in `psql`, or Supabase Studio's table editor), and the app should still load fine with whatever todos existed before v1.1.0's migration ran.

## What's deliberately NOT included

- **release-please.yaml** - the real one is tightly coupled to totalfamily's changelog/versioning conventions. Releases here are created manually via `gh api repos/.../releases` above instead. Worth building a real adapted version later if this sandbox proves useful long-term.
- **hotfix-release.yaml / hotfix-siding.yaml** - out of scope for this round; add later if needed.
- **Slack notifications** - removed entirely, no webhook dependency.
- **GitHub App bot token** - `mark-stable` steps use the workflow's own `GITHUB_TOKEN` instead.
- **E2E tests** - no Playwright suite; this sandbox is CI-pipeline-shaped, not product-shaped.
