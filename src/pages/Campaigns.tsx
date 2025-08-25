import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

export type Campaign = {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  progress: number;
  metrics: { sent: number; clicks: number; replied: number };
};

export default function CampaignsPage() {
  useEffect(() => {
    document.title = "Campaigns | Premium Dashboard";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Campaigns – liste, detay, sekmeler ve mock grafik.");
  }, []);

  const [campaigns, setCampaigns] = useLocalStorage<Campaign[]>("campaigns", [
    { id: "1", name: "US SaaS Cold", status: "active", progress: 45, metrics: { sent: 1200, clicks: 210, replied: 80 } },
    { id: "2", name: "EU FinTech", status: "paused", progress: 20, metrics: { sent: 400, clicks: 60, replied: 10 } },
  ]);
  const [selected, setSelected] = useState<string | null>(campaigns[0]?.id ?? null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const current = useMemo(() => campaigns.find((c) => c.id === selected) ?? null, [campaigns, selected]);

  const add = () => {
    const id = String(Date.now());
    const c: Campaign = { id, name: name || `New Campaign ${campaigns.length + 1}`, status: "paused", progress: 0, metrics: { sent: 0, clicks: 0, replied: 0 } };
    setCampaigns([c, ...campaigns]);
    setSelected(id);
    setOpen(false);
    setName("");
    toast.success("Campaign created");
  };

  const toggle = (id: string) => {
    setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)));
    toast("Campaign status updated");
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Campaigns</h1>
            <p className="text-sm text-muted-foreground">Active: {campaigns.filter(c=>c.status==='active').length} • Paused: {campaigns.filter(c=>c.status==='paused').length}</p>
          </div>
          <Button variant="hero" onClick={() => setOpen(true)}>+ Add New</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <Card key={c.id} className="bg-card/70 border-border/60 backdrop-blur hover:translate-y-[-2px] transition-transform">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{c.name}</span>
                  <Badge variant="secondary">{c.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">Sent {c.metrics.sent} • Clicks {c.metrics.clicks} • Replied {c.metrics.replied}</div>
                <Progress value={c.progress} />
                <div className="flex gap-2">
                  <Button size="sm" variant="hero" onClick={() => toggle(c.id)}>{c.status === 'active' ? 'Pause' : 'Start'}</Button>
                  <Button size="sm" variant="outlineGlow" onClick={() => setSelected(c.id)}>Open</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {current && (
          <div className="mt-8">
            <Card className="bg-card/70 border-border/60 backdrop-blur">
              <CardHeader>
                <CardTitle>{current.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="analytics">
                  <TabsList>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                    <TabsTrigger value="sequences">Sequences</TabsTrigger>
                    <TabsTrigger value="options">Options</TabsTrigger>
                  </TabsList>

                  <TabsContent value="analytics" className="mt-4">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <Stat title="Sequence started" value={current.metrics.sent} />
                      <Stat title="Click rate" value={`${Math.round((current.metrics.clicks/(current.metrics.sent||1))*100)}%`} />
                      <Stat title="Reply rate" value={`${Math.round((current.metrics.replied/(current.metrics.sent||1))*100)}%`} />
                    </div>
                    <div className="h-64">
                      <Chart />
                    </div>
                  </TabsContent>

                  <TabsContent value="leads" className="mt-4 text-sm text-muted-foreground">Leads table placeholder</TabsContent>
                  <TabsContent value="sequences" className="mt-4 text-sm text-muted-foreground">Steps editor placeholder</TabsContent>
                  <TabsContent value="options" className="mt-4 text-sm text-muted-foreground">Scheduling & toggles placeholder</TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
          </DialogHeader>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <DialogFooter>
            <Button onClick={add}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="bg-card/70 border-border/60">
      <CardContent className="pt-4">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="text-xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Chart() {
  const data = Array.from({ length: 12 }).map((_, i) => ({
    name: `W${i + 1}`,
    sent: 100 + i * 20,
    opens: 60 + i * 10,
    replies: 10 + i * 4,
  }));
  return (
    <AreaChart data={data} width={800} height={240}>
      <defs>
        <linearGradient id="gradSent" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="hsl(var(--brand-cyan))" stopOpacity={0.6} />
          <stop offset="95%" stopColor="hsl(var(--brand-cyan))" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
      <YAxis stroke="hsl(var(--muted-foreground))" />
      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
      <Area type="monotone" dataKey="sent" stroke="hsl(var(--brand-cyan))" fill="url(#gradSent)" />
      <Area type="monotone" dataKey="opens" stroke="hsl(var(--brand-purple))" fillOpacity={0} />
      <Area type="monotone" dataKey="replies" stroke="hsl(var(--primary))" fillOpacity={0} />
    </AreaChart>
  );
}

// Campaigns adında bir adlandırılmış dışa aktarma ekliyoruz
export { CampaignsPage as Campaigns };