import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const SocialProof: React.FC = () => {
  return (
    <section aria-labelledby="trust-heading" className="container px-4 py-20">
      <h2 id="trust-heading" className="text-3xl md:text-4xl font-bold text-center mb-10">
        Güven ve Sosyal Kanıt
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-card/60 border-border/60"><CardContent className="pt-6 text-center"><div className="text-4xl font-extrabold">+5000</div><div className="text-muted-foreground mt-1">Tamamlanan kampanya</div></CardContent></Card>
        <Card className="bg-card/60 border-border/60"><CardContent className="pt-6 text-center"><div className="text-4xl font-extrabold">%15</div><div className="text-muted-foreground mt-1">Ortalama yanıt oranı</div></CardContent></Card>
        <Card className="bg-card/60 border-border/60"><CardContent className="pt-6 text-center"><div className="text-4xl font-extrabold">99.9%</div><div className="text-muted-foreground mt-1">SLA & Uptime</div></CardContent></Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <Card key={i} className="bg-card/60 border-border/60">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                “Platform sayesinde satış pipeline'ımız 6 haftada 3 kat büyüdü. Lead kalitesi ve otomasyon akışları mükemmel.”
              </p>
              <div className="mt-4 text-sm">— Growth Lead, Seri A SaaS</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default SocialProof;