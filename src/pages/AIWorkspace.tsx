import { useEffect, useMemo, useRef, useState } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AgentHeader } from "@/components/workspace/AgentHeader";
import { Selection, SelectionRow, SECTION_OPTIONS } from "@/components/workspace/SelectionRow";
import { ConnectionLines } from "@/components/workspace/ConnectionLines";
import { HexIcon } from "@/components/workspace/HexIcon";
import { ChatBox } from "@/components/workspace/ChatBox";
import { RightPanelSlideOver } from "@/components/workspace/RightPanelSlideOver";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { motion } from "framer-motion";

const Y_OFFSETS = [0, -36, 36];

type Workspace = {
  id: string;
  name: string;
  createdAt: string;
  selections: Selection;
  messages: any[];
  agentsNotes: Record<string, any[]>;
  panelMinimized?: boolean;
};

const DEFAULT_SELECTIONS: Selection = { s1: null, s2: null, s3: null, s4: null, s5: null, s6: null };

export default function AIWorkspacePage() {
  useEffect(() => {
    document.title = "AI Work Space | Premium Dashboard";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "AI Work Space — seç, bağla, çalıştır. Mock verilerle demo.");
  }, []);

  const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>("ai_workspaces", []);
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(workspaces[0]?.id ?? null);

  const current = useMemo(() => workspaces.find((w) => w.id === currentId) || null, [workspaces, currentId]);

  const create = () => {
    const id = String(Date.now());
    const ws: Workspace = {
      id,
      name: name || `Workspace ${workspaces.length + 1}`,
      createdAt: new Date().toISOString(),
      selections: { ...DEFAULT_SELECTIONS },
      messages: [],
      agentsNotes: { eva: [], leo: [], mike: [], sophie: [], ash: [], clara: [] },
    };
    setWorkspaces([ws, ...workspaces]);
    setCurrentId(id);
    setOpenCreate(false);
    setName("");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-gray-950 py-6">
        <section aria-labelledby="aiws-title" className="container mx-auto">
        <h1 id="aiws-title" className="sr-only">AI Work Space</h1>

        <Card className="bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 backdrop-blur overflow-hidden">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">AI Work Space</CardTitle>
            <div className="flex items-center gap-2">
              <RightPanelSlideOver />
              <Button variant="hero" onClick={() => setOpenCreate(true)}>Create</Button>
            </div>
          </CardHeader>
          <CardContent>
            {!current ? (
              <div className="h-[60vh] grid place-items-center">
                <button
                  onClick={() => setOpenCreate(true)}
                  className="rounded-full px-6 py-4 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-100/20 dark:hover:bg-gray-700/20 transition shadow-glow text-gray-900 dark:text-white"
                >
                  AI Work Space — Create
                </button>
              </div>
            ) : (
              <WorkspaceBoard
                workspace={current}
                onUpdate={(ws) => setWorkspaces(workspaces.map((w) => (w.id === ws.id ? ws : w)))}
                onSwitch={(id) => setCurrentId(id)}
                list={workspaces}
              />
            )}
          </CardContent>
        </Card>
        </section>
      </div>
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Workspace</DialogTitle>
          </DialogHeader>
          <Input placeholder="Ad" value={name} onChange={(e) => setName(e.target.value)} />
          <DialogFooter>
            <Button onClick={create}>Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function WorkspaceBoard({ workspace, list, onUpdate, onSwitch }: {
  workspace: Workspace;
  list: Workspace[];
  onUpdate: (ws: Workspace) => void;
  onSwitch: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [positions, setPositions] = useState<Record<keyof Selection, number>>({ s1: 0, s2: 0, s3: 0, s4: 0, s5: 0, s6: 0 });

  const setSel = (k: keyof Selection, v: string) => {
    const idx = Math.floor(Math.random() * 3);
    setPositions((p) => ({ ...p, [k]: idx }));
    const next = { ...workspace, selections: { ...workspace.selections, [k]: v } };
    onUpdate(next);
  };

  // Track node centers for connection lines
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const nodes = (Object.keys(workspace.selections) as (keyof Selection)[]).map((k) => {
    const sel = workspace.selections[k];
    if (!sel) return null;
    const el = nodeRefs.current[k + ":main"];
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const host = containerRef.current?.getBoundingClientRect();
    if (!host) return null;
    return { x: rect.left - host.left + rect.width / 2, y: rect.top - host.top + rect.height / 2 };
  });

  useEffect(() => {
    const onResize = () => {
      // trigger rerender
      setPositions((p) => ({ ...p }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <AgentHeader onClick={() => { /* open panel via RightPanelSlideOver button */ }} />
        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
          <span>Open:</span>
          <select className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-2 py-1" value={workspace.id} onChange={(e) => onSwitch(e.target.value)}>
            {list.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div ref={containerRef} className="relative rounded-2xl border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur overflow-hidden">
        <div className="grid grid-cols-6 gap-2 p-6 min-h-[48vh]">
          {(Object.keys(workspace.selections) as (keyof Selection)[]).map((k, i) => {
            const optList = SECTION_OPTIONS[k];
            const selectedKey = workspace.selections[k];
            const selected = optList.find((o) => o.key === selectedKey) ?? null;
            const yIdx = positions[k] ?? 0;
            const y = Y_OFFSETS[yIdx];

            return (
              <div key={k} className="relative flex items-center justify-center">
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y, scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  >
                    <HexIcon
                      ref={(el: any) => (nodeRefs.current[k + ":main"] = el)}
                      title={selected.label}
                      Icon={selected.Icon}
                      selected
                      glow
                    />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
        <ConnectionLines nodes={nodes} />
      </div>

      <SelectionRow value={workspace.selections} onChange={setSel as any} />

      <div className="grid md:grid-cols-[320px,1fr] gap-6 mt-4">
        <Card className="bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Chat</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ChatBox onModeChange={() => {}} />
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 border-gray-200/60 dark:border-gray-700/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Results (placeholder)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] grid place-items-center text-sm text-gray-500 dark:text-gray-400">Task results will appear here.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// AIWorkspace adında bir adlandırılmış dışa aktarma ekliyoruz
export { AIWorkspacePage as AIWorkspace };