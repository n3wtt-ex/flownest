import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const SocialProof: React.FC = () => {
  return (
    <section aria-labelledby="trust-heading" className="container py-20">
      <h2 id="trust-heading" className="text-3xl md:text-4xl font-bold text-center mb-10 dark:text-white">
        Güven ve Sosyal Kanıt
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-card/60 border-border/60 dark:bg-gray-800/60 dark:border-gray-700/60">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-extrabold dark:text-white">+5000</div>
            <div className="text-sm text-muted-foreground mt-1 dark:text-gray-400">Tamamlanan kampanya</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/60 dark:bg-gray-800/60 dark:border-gray-700/60">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-extrabold dark:text-white">%15</div>
            <div className="text-sm text-muted-foreground mt-1 dark:text-gray-400">Ortalama yanıt oranı</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/60 dark:bg-gray-800/60 dark:border-gray-700/60">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-extrabold dark:text-white">99.9%</div>
            <div className="text-sm text-muted-foreground mt-1 dark:text-gray-400">SLA & Uptime</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <Card key={i} className="bg-card/60 border-border/60 dark:bg-gray-800/60 dark:border-gray-700/60">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground dark:text-gray-400">
                "Platform sayesinde satış pipeline'ımız 6 haftada 3 kat büyüdü. Lead kalitesi ve otomasyon akışları mükemmel."
              </p>
              <div className="mt-4 text-sm dark:text-gray-300">— Growth Lead, Seri A SaaS</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default SocialProof;