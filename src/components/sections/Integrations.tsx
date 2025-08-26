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
    <section id="integrations" aria-labelledby="integrations-heading" className="container py-20">
      <h2 id="integrations-heading" className="text-3xl md:text-4xl font-bold text-center mb-10 dark:text-white">
        Entegrasyonlar
      </h2>

      <Card className="bg-card/60 border-border/60 p-8 dark:bg-gray-800/60 dark:border-gray-700/60">
        <div className="flex flex-wrap justify-center gap-6">
          {tools.map((t) => (
            <div key={t.name} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(25%-18px)] flex flex-col items-center gap-2 hover-scale dark:text-gray-300">
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