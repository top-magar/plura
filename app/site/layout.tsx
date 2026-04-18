import Navigation from "@/components/site/navigation";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-full">
      <Navigation />
      {children}
    </main>
  );
}
