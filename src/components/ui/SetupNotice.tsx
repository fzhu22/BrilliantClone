export function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h1 className="text-xl font-bold">Almost there</h1>
        <p className="mt-3 text-sm text-muted">
          Firebase is not configured yet. Copy{" "}
          <code className="rounded bg-surface2 px-1.5 py-0.5 text-ink">
            .env.local.example
          </code>{" "}
          to{" "}
          <code className="rounded bg-surface2 px-1.5 py-0.5 text-ink">
            .env.local
          </code>
          , paste your Firebase project keys, then restart the dev server.
        </p>
        <p className="mt-3 text-sm text-muted">
          See the README for the full setup guide.
        </p>
      </div>
    </div>
  );
}
