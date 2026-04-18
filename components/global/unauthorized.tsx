import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold md:text-6xl">Unauthorized access!</h1>
      <p className="mt-4 text-muted-foreground">
        Please contact support or your agency owner to get access.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
