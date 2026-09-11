import pkg from "@/package.json";

export const metadata = {
  title: "Pipeline Sandbox",
};

// Visible on every deploy so a promotion/hotfix is obvious at a glance on
// the live URL, not just in GitHub Actions logs: color + label change per
// Vercel environment, plus the exact version and commit that's live.
const ENV_STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  production: { bg: "#0f6e5c", fg: "#ffffff", label: "production" },
  preview: { bg: "#a4661f", fg: "#ffffff", label: "preview" },
  development: { bg: "#3d4a46", fg: "#ffffff", label: "development" },
};

function EnvBadge() {
  const env = process.env.VERCEL_ENV ?? "development";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
  const { bg, fg, label } = ENV_STYLES[env] ?? ENV_STYLES.development;

  return (
    <div
      style={{
        background: bg,
        color: fg,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textAlign: "center",
        padding: "6px 8px",
      }}
    >
      {label} &middot; v{pkg.version} &middot; {sha}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <EnvBadge />
        {children}
      </body>
    </html>
  );
}
