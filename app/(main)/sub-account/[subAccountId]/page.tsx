export default function SubAccountDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Sub account overview and metrics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Funnels", "Media Files", "Pipeline Tickets"].map((label) => (
          <div key={label} className="rounded-lg border p-4 sm:p-5">
            <p className="text-[13px] text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">0</p>
          </div>
        ))}
      </div>
    </div>
  );
}
