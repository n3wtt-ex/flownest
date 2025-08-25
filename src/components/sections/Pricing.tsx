import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  { 
    name: "Anahtar Teslim Otomasyon", 
    price: "", 
    features: [
      "Hedef müşteri tespiti", 
      "Kişiselleştirilmiş kampanyalar", 
      "Otomatik yanıt takibi",
      "Toplantı ayarlama",
      "CRM entegrasyonu",
      "7/24 AI agent desteği"
    ], 
    cta: "Satış ekibimizle iletişime geçin",
    featured: true 
  },
];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="container px-4 py-20">
      <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold text-center mb-10">
        Fiyatlandırma
      </h2>

      <div className="max-w-2xl mx-auto">
        {plans.map((p) => (
          <Card key={p.name} className={`bg-card/60 border ${p.featured ? "border-primary/50 shadow-glow" : "border-border/60"}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">{p.name}</CardTitle>
              {p.price && <span className="text-3xl font-extrabold">{p.price}</span>}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8 text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="text-primary">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={p.featured ? "hero" : "outlineGlow"} className="w-full hover-scale" size="lg" onClick={() => navigate("/login")}>
                {p.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Pricing;