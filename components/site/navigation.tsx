import { UserButton } from "@clerk/nextjs";
import { Show } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/global/mode-toggle";

const navLinks = [
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#" },
  { label: "Documentation", href: "#" },
  { label: "Features", href: "#" },
];

export default function Navigation() {
  return (
    <header className="fixed top-0 right-0 left-0 z-20 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/assets/plura-logo.svg" width={40} height={40} alt="plura logo" />
          <span className="text-xl font-bold">Plura.</span>
        </Link>

        {/* Desktop Nav */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="gap-2">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.label}>
                <NavigationMenuLink
                  href={link.href}
                  className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Show when="signed-out">
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/agency">Login</Link>
            </Button>
          </Show>
          <ModeToggle />

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 pt-8">
                <Link href="/" className="flex items-center gap-2 px-2">
                  <Image src="/assets/plura-logo.svg" width={32} height={32} alt="plura logo" />
                  <span className="text-lg font-bold">Plura.</span>
                </Link>
                <Separator />
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <Separator />
                <Show when="signed-out">
                  <Button asChild className="w-full">
                    <Link href="/agency">Login</Link>
                  </Button>
                </Show>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
