import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AGENTS = [
  { key: "eva", name: "Eva", role: "Project Director" },
  { key: "leo", name: "Leo", role: "Lead Researcher" },
  { key: "mike", name: "Mike", role: "Campaign Manager" },
  { key: "sophie", name: "Sophie", role: "Copywriter" },
  { key: "ash", name: "Ash", role: "Engagement & CRM Assistant" },
  { key: "clara", name: "Clara", role: "Feedback Analyst" },
];

export function AgentHeader({ onClick }: { onClick: (agentKey: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 overflow-x-auto py-2">
      {AGENTS.map((a) => (
        <button
          key={a.key}
          onClick={() => onClick(a.key)}
          className="flex flex-col items-center gap-1 px-2 py-1 rounded-md hover:bg-accent/30 focus:outline-none focus-visible:ring-2 ring-ring"
        >
          <Avatar className="w-10 h-10">
            <AvatarFallback>{a.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-xs font-semibold">{a.name}</div>
          <div className="text-[10px] text-muted-foreground">{a.role}</div>
        </button>
      ))}
    </div>
  );
}
