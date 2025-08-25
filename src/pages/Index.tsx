import React, { useEffect } from "react";
import Navigation from "@/components/sections/Navigation";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import AssistantDemo from "@/components/sections/AssistantDemo";
import Integrations from "@/components/sections/Integrations";
import SocialProof from "@/components/sections/SocialProof";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import SiteFooter from "@/components/sections/SiteFooter";

const Index: React.FC = () => {
  useEffect(() => {
    document.title = "B2B Satış Otomasyon Platformu | Anahtar Teslim";

    const desc = "B2B satışta yeni çağ: lead bulma, kampanya, yanıt takibi, toplantı ve CRM — hepsi tek platformda, yapay zeka destekli.";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    // canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + '/');

    // JSON-LD structured data
    const ld = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Orkestra — B2B Satış Otomasyon Platformu",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "AggregateOffer",
        lowPrice: 0,
        priceCurrency: "USD",
      },
      aggregateRating: { "@type": "AggregateRating", ratingValue: 4.8, reviewCount: 124 },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Features />
        <AssistantDemo />
        <Integrations />
        <SocialProof />
        <Pricing />
        <FAQ />
      </main>
      <SiteFooter />
    </>
  );
};

export default Index;
