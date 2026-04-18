import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/site(.*)",
  "/api/upload(.*)",
  "/api/stripe/webhook(.*)",
  "/editor(.*)",
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
]);

function getSubdomain(host: string): string | null {
  const domain = process.env.NEXT_PUBLIC_DOMAIN!;
  if (!host.endsWith(domain)) return null;
  const sub = host.replace(`.${domain}`, "");
  return sub !== host && sub.length > 0 ? sub : null;
}

function rewrite(request: NextRequest, path: string): NextResponse {
  return NextResponse.rewrite(new URL(path, request.url));
}

export default clerkMiddleware(async (auth, request) => {
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const params = searchParams.toString();
  const fullPath = `${pathname}${params ? `?${params}` : ""}`;

  // 1. Subdomain → serve published funnel (public)
  const subdomain = getSubdomain(host);
  if (subdomain) {
    return rewrite(request, `/${subdomain}${fullPath}`);
  }

  // 2. Root → site
  if (pathname === "/") {
    return rewrite(request, "/site");
  }

  // 3. Protected routes → let Clerk handle auth
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
