import { ArrowRight, Check, Zap, Users, BarChart3, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";

const features = [
  { icon: Zap, title: "Sub Accounts", description: "Create and manage unlimited sub accounts for each of your clients." },
  { icon: Users, title: "Team Management", description: "Invite team members and control access with granular permissions." },
  { icon: BarChart3, title: "Pipelines", description: "Kanban-style boards to track leads, deals, and business processes." },
  { icon: Globe, title: "Funnel Builder", description: "Drag-and-drop website and funnel builder with custom domains." },
];

const faqs = [
  { q: "Can I manage multiple clients?", a: "Yes. Each client gets their own sub account with isolated data, media, contacts, and pipelines." },
  { q: "How does billing work?", a: "We use Stripe Connect so you can charge clients directly and collect platform fees on every transaction." },
  { q: "Is there a free plan?", a: "Absolutely. The Starter plan is free and includes 3 sub accounts, 2 team members, and unlimited pipelines." },
  { q: "Can I white-label the platform?", a: "Yes. Agency owners can toggle white-labeling to show their own branding to sub account users." },
];

export default function SitePage() {
  return (
    <TooltipProvider>
      {/* Hero */}
      <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e2e2_1px,transparent_1px),linear-gradient(to_bottom,#e2e2e2_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)]" />

        <div className="mt-24 flex flex-col items-center gap-6 px-4">
          <Badge variant="secondary" className="gap-1.5 rounded-full px-4 py-1.5">
            An all-in-one agency solution
          </Badge>

          <div className="relative bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
            <h1 className="text-center text-7xl font-bold leading-tight md:text-[200px] lg:text-[300px]">
              Plura
            </h1>
          </div>

          <p className="max-w-xl text-center text-lg text-muted-foreground">
            Run your agency in one place. Manage sub accounts, pipelines,
            funnels, media, and team members — all from a single dashboard.
          </p>

          <div className="relative z-20 flex gap-3">
            <Button asChild size="lg">
              <Link href="/agency">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-16 flex w-full max-w-6xl items-center justify-center px-4">
          <Image
            src="/assets/preview.png"
            alt="banner image"
            height={1200}
            width={1200}
            className="rounded-t-2xl border-2 border-muted shadow-2xl"
          />
          <div className="absolute inset-x-0 bottom-0 top-1/2 z-10 bg-gradient-to-t from-background" />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4 rounded-full">Features</Badge>
          <h2 className="text-4xl font-bold">Everything you need to scale</h2>
          <p className="mt-3 text-muted-foreground">
            Powerful tools built for agencies that want to grow.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Tooltip key={f.title}>
              <TooltipTrigger asChild>
                <Card className="cursor-default transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>Click Get Started to try {f.title}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-4xl" />

      {/* Pricing with Tabs */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4 rounded-full">Pricing</Badge>
          <h2 className="text-4xl font-bold">Choose what fits you right</h2>
          <p className="mt-3 text-muted-foreground">
            Our straightforward pricing plans are tailored to meet your needs.
          </p>
        </div>

        <Tabs defaultValue="monthly" className="flex flex-col items-center">
          <TabsList className="mb-8">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annually">Annually (coming soon)</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="w-full">
            <div className="flex flex-wrap items-stretch justify-center gap-6">
              {pricingCards.map((card) => {
                const isPro = card.title === "Unlimited Saas";
                return (
                  <Card
                    key={card.title}
                    className={clsx(
                      "flex w-[320px] flex-col justify-between transition-shadow hover:shadow-lg",
                      isPro && "border-2 border-primary shadow-lg shadow-primary/10"
                    )}
                  >
                    <CardHeader>
                      {isPro && (
                        <Badge className="mb-2 w-fit">Most Popular</Badge>
                      )}
                      <CardTitle className={clsx(!isPro && "text-muted-foreground")}>
                        {card.title}
                      </CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-4xl font-bold">{card.price}</span>
                      {card.duration && (
                        <span className="text-muted-foreground">/{card.duration}</span>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-4">
                      <Separator />
                      <div className="flex flex-col gap-2">
                        {card.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 shrink-0 text-primary" />
                            <p className="text-sm text-muted-foreground">{feature}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        asChild
                        className="mt-2 w-full"
                        variant={isPro ? "default" : "secondary"}
                      >
                        <Link href={`/agency?plan=${card.priceId}`}>
                          Get Started
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="annually" className="w-full">
            <p className="py-20 text-center text-muted-foreground">
              Annual pricing coming soon. Stay tuned!
            </p>
          </TabsContent>
        </Tabs>
      </section>

      <Separator className="mx-auto max-w-4xl" />

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20">
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4 rounded-full">FAQ</Badge>
          <h2 className="text-4xl font-bold">Frequently asked questions</h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer CTA */}
      <section className="border-t bg-muted/30 px-4 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mt-3 text-muted-foreground">
          Join thousands of agencies already using Plura.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/agency">
            Start for Free <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </TooltipProvider>
  );
}
