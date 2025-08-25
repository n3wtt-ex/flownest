import React from "react";
import { Card } from "@/components/ui/card";
import { Database, Globe, Sparkles, MapPin, MessageSquare, Calendar, Workflow, Zap } from "lucide-react";

const tools = [
  { icon: Sparkles, name: "OpenAI" },
  { icon: Database, name: "Supabase" },
  { icon: MessageSquare, name: "Instantly" },
  { icon: Globe, name: "Apollo" },
  { icon: MapPin, name: "Google Maps" },
  { icon: Zap, name: "Bright Data" },
  { icon: Calendar, name: "Cal.com" },
  { icon: Workflow, name: "n8n" },
];

const Integrations: React.FC = () => {
  return (
    <section id="integrations" aria-labelledby="integrations-heading" className="container px-4 py-20 dark:bg-gray-900">
      <h2 id="integrations-heading" className="text-3xl md:text-4xl font-bold text-center mb-10 dark:text-white">
        Entegrasyonlar
      </h2>

      <Card className="bg-card/60 border-border/60 p-8 dark:bg-gray-800/60 dark:border-gray-700/60">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
          {tools.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-2 hover-scale dark:text-gray-300">
              <t.icon className="h-8 w-8 text-primary dark:text-blue-400" />
              <span className="text-sm text-muted-foreground dark:text-gray-400">{t.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

export default Integrations;