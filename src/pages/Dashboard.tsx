import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Bot,
  MapPin,
  Megaphone,
  Wand2,
  Inbox,
  Briefcase,
  User,
  PlayCircle,
  Rocket,
} from "lucide-react";

const sections = [
  { id: "ai-agent", label: "AI Agent Bot", icon: Bot },
  { id: "lead-finding", label: "Lead Finding", icon: MapPin },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "email-personalization", label: "Email Personalization", icon: Wand2 },
  { id: "feedback", label: "Feedback", icon: Inbox },
  { id: "crm", label: "CRM", icon: Briefcase },
  { id: "account", label: "Account", icon: User },
] as const;

type SectionId = typeof sections[number]["id"];

export default function Dashboard() {
  const [active, setActive] = useState<SectionId>("ai-agent");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = "Dashboard | B2B Satış Otomasyon";
    const desc = "Modern B2B Sales Automation Dashboard – AI bot, lead, kampanya, kişiselleştirme ve inbox.";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    // canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/dashboard');
  }, []);

  // Scrollspy
  useEffect(() => {
    const elms = sections.map((s) => document.getElementById(s.id));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id as SectionId);
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] }
    );
    elms.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const onNavClick = (id: SectionId) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const requireLogin = () => {
    if (!isLoggedIn) setLoginOpen(true);
  };

  return (
    <Layout>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar collapsible="icon" variant="floating" className="bg-card/60 backdrop-blur border-border/60">
            <SidebarContent>
              <div className="p-2 text-xs text-muted-foreground">Navigate</div>
              <SidebarMenu>
                {sections.map((s) => (
                  <SidebarMenuItem key={s.id}>
                    <SidebarMenuButton
                      isActive={active === s.id}
                      onClick={() => onNavClick(s.id)}
                      className={active === s.id ? "ring-1 ring-primary/60 shadow-glow bg-accent/20" : ""}
                      tooltip={s.label}
                    >
                      <s.icon />
                      <span>{s.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          <SidebarInset>
            <header className="sticky top-0 z-20 h-12 border-b bg-background/60 backdrop-blur flex items-center gap-2 px-3">
              <SidebarTrigger />
              <div className="text-sm text-muted-foreground">Modern B2B Sales Automation Dashboard</div>
            </header>

            <div ref={containerRef} className="scroll-smooth">
              <AIAgentBot onActionClick={requireLogin} />
              <LeadFinding />
              <Campaigns onCreate={() => requireLogin()} />
              <EmailPersonalization />
              <Feedback />
              <CRM />
              <Account />
            </div>
          </SidebarInset>
        </div>

        <LoginModal
          open={loginOpen}
          onOpenChange={setLoginOpen}
          onSubmit={() => {
            setIsLoggedIn(true);
            setLoginOpen(false);
          }}
        />
      </SidebarProvider>
    </Layout>
  );
}

// Sections
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function SectionShell({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.2 }}
      variants={sectionVariants}
      className="min-h-screen w-full flex items-center"
    >
      <div className="container mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gradient-hero">{title}</h2>
        {children}
      </div>
    </motion.section>
  );
}

function AIAgentBot({ onActionClick }: { onActionClick: () => void }) {
  return (
    <SectionShell id="ai-agent" title="AI Agent Bot">
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {/* Chat */}
        <Card className="bg-card/70 backdrop-blur border-border/60">
          <CardHeader>
            <CardTitle>Asistan Sohbeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xs text-muted-foreground">Kullanıcı</div>
            <div className="rounded-full px-4 py-3 border border-border/60 bg-background/60 w-fit max-w-[85%]">ABD FinTech için 300 lead çıkar ve 4 adımlı cold e‑posta sekansı hazırla.</div>

            <div className="text-xs text-muted-foreground">Bot</div>
            <div className="rounded-2xl px-4 py-3 border border-primary/40 bg-secondary/20 w-fit max-w-[85%]">
              Hedef pazar filtrelendi. 327 uygun lead bulundu. Sekans taslağı hazır. <span className="opacity-70">(yazıyor…)</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-pulse [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:240ms]" />
            </div>
          </CardContent>
        </Card>

        {/* Workspace */}
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-hero opacity-20 blur-3xl rounded-full" aria-hidden />
          <Card className="relative bg-card/70 backdrop-blur border-border/60 overflow-hidden">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Workspace</CardTitle>
              <div className="flex gap-2">
                <Button variant="hero" size="lg" onClick={onActionClick}>
                  <PlayCircle /> Work
                </Button>
                <Button variant="outlineGlow" size="lg" onClick={onActionClick}>
                  <Rocket /> Ask
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-80 rounded-xl border border-border/60 bg-[radial-gradient(1200px_circle_at_10%_-20%,hsl(var(--brand-cyan)/0.08),transparent_40%),radial-gradient(1200px_circle_at_90%_-10%,hsl(var(--brand-purple)/0.08),transparent_40%)]" />
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionShell>
  );
}

function LeadFinding() {
  return (
    <SectionShell id="lead-finding" title="Lead Finding">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mini chat + actions */}
        <div className="space-y-4 relative">
          <Card className="bg-card/70 backdrop-blur border-border/60">
            <CardHeader>
              <CardTitle>Sorgu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">NYC, AI SaaS, 10–50 çalışan, C‑level kontak</div>
              <div className="rounded-lg border border-primary/40 bg-secondary/20 p-3 text-sm">32 potansiyel sonuç bulundu. Kaynak: Google Maps, Apollo.</div>
            </CardContent>
          </Card>

          {/* Floating bubbles */}
          <div className="absolute -top-3 -right-3 flex gap-3">
            <div className="w-14 h-14 rounded-full border border-primary/40 bg-secondary/30 backdrop-blur flex items-center justify-center shadow-glow">GM</div>
            <div className="w-14 h-14 rounded-full border border-primary/40 bg-secondary/30 backdrop-blur flex items-center justify-center shadow-glow">Ap</div>
          </div>
        </div>

        {/* Table placeholder */}
        <Card className="bg-card/70 backdrop-blur border-border/60">
          <CardHeader>
            <CardTitle>Sonuçlar (örnek)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="hover:bg-accent/20">
                      <TableCell>Acme AI</TableCell>
                      <TableCell>CTO</TableCell>
                      <TableCell>NYC</TableCell>
                      <TableCell>ct[email protected]</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function Campaigns({ onCreate }: { onCreate: () => void }) {
  return (
    <SectionShell id="campaigns" title="Campaigns">
      <div className="flex justify-end mb-4">
        <Button variant="hero" size="lg" onClick={onCreate}>Create New Campaign</Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-card/70 border-border/60 backdrop-blur hover:translate-y-[-2px] transition-transform">
            <CardHeader>
              <CardTitle>US SaaS Cold #{i + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Sent: {20 + i * 5} • Replies: {5 + i}</div>
              <Progress value={30 + i * 10} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail placeholder */}
      <div className="mt-8">
        <Card className="bg-card/70 border-border/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Campaign Detail (tabs placeholder)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">Analytics / Leads / Steps / Settings (UI taslağı)</CardContent>
        </Card>
      </div>
    </SectionShell>
  );
}

function EmailPersonalization() {
  const columns = useMemo(() => [
    "first_name",
    "last_name",
    "company_name",
    "email",
    "step_1_title",
    "step_1_body",
    "linkedin_message",
  ], []);

  return (
    <SectionShell id="email-personalization" title="Email Personalization">
      <div className="overflow-auto">
        <Table>
          <TableHeader className="sticky top-0">
            <TableRow>
              <TableHead className="w-40">Action</TableHead>
              {columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-accent/20">
                <TableCell>
                  <Button size="sm" variant="hero">Personalize Email</Button>
                </TableCell>
                <TableCell>Jane</TableCell>
                <TableCell>Doe</TableCell>
                <TableCell>Acme AI</TableCell>
                <TableCell>jane.doe@acme.ai</TableCell>
                <TableCell>Intro</TableCell>
                <TableCell>Hi Jane…</TableCell>
                <TableCell>Hey Jane, saw your post…</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 sticky bottom-4">
        <Button variant="outlineGlow">Select All</Button>
      </div>
    </SectionShell>
  );
}

function Feedback() {
  return (
    <SectionShell id="feedback" title="Feedback (Inbox)">
      <Card className="bg-card/70 border-border/60 backdrop-blur">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Reply</TableHead>
                <TableHead>Interest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-accent/20">
                  <TableCell>john@company.com</TableCell>
                  <TableCell>Re: intro</TableCell>
                  <TableCell>Let’s talk next week…</TableCell>
                  <TableCell>Pending</TableCell>
                  <TableCell>Warm</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function CRM() {
  return (
    <SectionShell id="crm" title="CRM (no design changes)">
      <Card className="bg-card/70 border-border/60 backdrop-blur">
        <CardContent>
          <div className="text-muted-foreground text-sm">Mevcut CRM görünümü korunur (placeholder).</div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function Account() {
  return (
    <SectionShell id="account" title="Account (no design changes)">
      <Card className="bg-card/70 border-border/60 backdrop-blur">
        <CardContent>
          <div className="text-muted-foreground text-sm">Mevcut Account görünümü korunur (placeholder).</div>
        </CardContent>
      </Card>
    </SectionShell>
  );
}

function LoginModal({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (v: boolean) => void; onSubmit: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur bg-card/70 border-border/60">
        <DialogHeader>
          <DialogTitle>Giriş Yap</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" variant="hero" className="w-full">Giriş Yap</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dashboard adında bir adlandırılmış dışa aktarma ekliyoruz
export { Dashboard };