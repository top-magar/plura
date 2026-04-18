export default function AgencyDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">
          Overview of your agency performance and metrics.
        </p>
      </div>

      {/* Placeholder cards - responsive grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Sub Accounts", "Active Pipelines", "Total Contacts"].map((label) => (
          <div key={label} className="rounded-lg border p-4 sm:p-5">
            <p className="text-[13px] text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">0</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4 sm:p-5">
          <p className="text-[13px] font-medium">Recent Activity</p>
          <p className="mt-4 text-center text-[13px] text-muted-foreground">No recent activity</p>
        </div>
        <div className="rounded-lg border p-4 sm:p-5">
          <p className="text-[13px] font-medium">Quick Actions</p>
          <p className="mt-4 text-center text-[13px] text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
