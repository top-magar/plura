"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConnectStripeButton({ agencyId }: { agencyId: string }) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleConnect} disabled={loading}>
      {loading ? <><Loader2 className="animate-spin" /> Connecting...</> : "Start"}
    </Button>
  );
}
