import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Megaphone, MailCheck, CalendarCheck, Plug } from "lucide-react";

const features = [
  { icon: Search, title: "Lead Bulma", desc: "Hedef pazarı filtreleyin, doğru kişilere ulaşın." },
  { icon: Megaphone, title: "Kampanya Oluşturma", desc: "Çok kanallı kampanyalarla kişiselleştirilmiş erişim." },
  { icon: MailCheck, title: "E-mail Kişiselleştirme", desc: "Yapay zeka ile her alıcıya özel e-posta içerikleri." },
  { icon: MailCheck, title: "Yanıt Takibi", desc: "Otomatik takip ve akıllı yanıt sınıflandırma." },
  { icon: CalendarCheck, title: "Toplantı Ayarlama", desc: "Yanıtları toplantıya dönüştüren akışlar." },
  { icon: Plug, title: "CRM Entegrasyonu", desc: "Salesforce, HubSpot ve daha fazlasıyla senkronizasyon." },
];

const Features: React.FC = () => {
  return (
    <section id="features" aria-labelledby="features-heading" className="container py-20">
      <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-10 text-center">
        Platform Özellikleri
      </h2>
      <div className="flex flex-wrap justify-center gap-6">
        {features.map((f) => (
          <div key={f.title} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)]">
            <Card className="border-border/60 bg-card/60 backdrop-blur-sm hover-scale h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <f.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">{f.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;