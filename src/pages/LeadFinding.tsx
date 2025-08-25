import { useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocalStorage } from "@/lib/useLocalStorage";

export type LeadRow = {
  id: string;
  name: string | null;
  company: string | null;
  title: string | null;
  email: string | null;
  source: 'apollo' | 'google_maps' | 'apify' | 'manual';
  status: 'new' | 'verified' | 'skipped';
  created_at: string;
};

export default function LeadFindingPage() {
  useEffect(() => {
    document.title = "Lead Finding | Premium Dashboard";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Lead Finding – chat arayüzü, provider seçimleri ve sonuç tablosu.");
  }, []);

  const [provider, setProvider] = useState<'apollo' | 'google_maps' | 'apify'>("apollo");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useLocalStorage<LeadRow[]>("lead_rows", []);
  const [filter, setFilter] = useState<'all' | 'new' | 'verified' | 'skipped'>("all");

  const filtered = useMemo(() => rows.filter(r => filter==='all' ? true : r.status===filter), [rows, filter]);

  const run = () => {
    if (!query.trim()) return;
    const mock: LeadRow = {
      id: String(Date.now()),
      name: "John Doe",
      company: "Acme AI",
      title: "CTO",
      email: "john@acme.ai",
      source: provider,
      status: "new",
      created_at: new Date().toISOString(),
    };
    setRows([mock, ...rows]);
  };

  const verify = (id: string) => setRows(rows.map(r => r.id===id ? { ...r, status: 'verified' } : r));

  return (
    <DashboardShell>
      <div className="container mx-auto grid md:grid-cols-[360px,1fr] gap-6">
        <Card className="bg-card/70 border-border/60 backdrop-blur h-full">
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Button variant={provider==='apollo'? 'hero':'outline'} onClick={() => setProvider('apollo')} className="rounded-full">Apollo</Button>
              <Button variant={provider==='google_maps'? 'hero':'outline'} onClick={() => setProvider('google_maps')} className="rounded-full">Google Maps</Button>
              <Button variant={provider==='apify'? 'hero':'outline'} onClick={() => setProvider('apify')} className="rounded-full">Apify</Button>
            </div>
            <div className="flex gap-2">
              <Input placeholder={`Query – provider: ${provider}`} value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=> e.key==='Enter' && run()} />
              <Button onClick={run}>Run</Button>
            </div>
            <div className="flex gap-2 text-xs">
              <Button size="sm" variant="secondary" onClick={()=>setFilter('all')}>All</Button>
              <Button size="sm" variant="secondary" onClick={()=>setFilter('new')}>New</Button>
              <Button size="sm" variant="secondary" onClick={()=>setFilter('verified')}>Verified</Button>
              <Button size="sm" variant="secondary" onClick={()=>setFilter('skipped')}>Skipped</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/60 backdrop-blur">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="h-64 grid place-items-center text-sm text-muted-foreground">No results yet. Run a search.</div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r, i) => (
                      <TableRow key={r.id} className="hover:bg-accent/20">
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.company}</TableCell>
                        <TableCell>{r.title}</TableCell>
                        <TableCell>{r.email}</TableCell>
                        <TableCell className="capitalize">{r.source.replace('_',' ')}</TableCell>
                        <TableCell>
                          <Badge variant={r.status==='verified' ? 'secondary' : 'outline'}>{r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.status !== 'verified' && (
                            <Button size="sm" variant="hero" onClick={() => verify(r.id)}>Add to Leads</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

// LeadFinding adında bir adlandırılmış dışa aktarma ekliyoruz
export { LeadFindingPage as LeadFinding };