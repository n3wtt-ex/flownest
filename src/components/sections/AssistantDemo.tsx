import React from "react";
import { Card } from "@/components/ui/card";

const AssistantDemo: React.FC = () => {
  return (
    <section id="demo" aria-labelledby="ai-heading" className="container px-4 py-20 dark:bg-gray-900">
      <h2 id="ai-heading" className="text-3xl md:text-4xl font-bold text-center mb-10 dark:text-white">
        AI Asistan Gösterimi
      </h2>

      <div className="relative">
        <div className="absolute -inset-12 bg-gradient-hero opacity-20 blur-3xl rounded-full" aria-hidden />
        <Card className="relative border-border/60 bg-card/70 backdrop-blur-sm p-6 max-w-4xl mx-auto dark:bg-gray-800/70 dark:border-gray-700/60">
          <div className="space-y-4">
            <div className="max-w-[85%]">
              <div className="text-xs text-muted-foreground mb-1 dark:text-gray-400">Kullanıcı</div>
              <div className="rounded-lg border border-border/50 bg-background/60 p-4 dark:bg-gray-700/60 dark:border-gray-600/50 dark:text-gray-300">
                SaaS startupları için ABD pazarı: FinTech ve AI sektörlerinde 500 lead çıkar, LinkedIn + e‑posta drip kampanyası kur.
              </div>
            </div>
            <div className="max-w-[85%] ml-auto text-right">
              <div className="text-xs text-muted-foreground mb-1 dark:text-gray-400">Asistan</div>
              <div className="rounded-lg border border-primary/30 bg-secondary/20 p-4 dark:bg-gray-700/20 dark:border-primary/20 dark:text-gray-300">
                Hedef pazar filtrelendi. 512 uygun lead bulundu. 3 adımlı çok kanallı sekans hazırlandı. İlk gönderim yarın 09:00.
              </div>
            </div>
            <div className="max-w-[85%]">
              <div className="text-xs text-muted-foreground mb-1 dark:text-gray-400">Kullanıcı</div>
              <div className="rounded-lg border border-border/50 bg-background/60 p-4 dark:bg-gray-700/60 dark:border-gray-600/50 dark:text-gray-300">
                Yanıtları toplantıya yönlendir; müsaitlik linkimi kullan.
              </div>
            </div>
            <div className="max-w-[85%] ml-auto text-right">
              <div className="text-xs text-muted-foreground mb-1 dark:text-gray-400">Asistan</div>
              <div className="rounded-lg border border-primary/30 bg-secondary/20 p-4 dark:bg-gray-700/20 dark:border-primary/20 dark:text-gray-300">
                Uygulandı. Pozitif yanıtlar otomatik takvime aktarılacak ve CRM ile senkronize edilecek.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default AssistantDemo;