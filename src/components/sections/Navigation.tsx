import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  { label: "Özellikler", href: "#features" },
  { label: "Entegrasyonlar", href: "#integrations" },
  { label: "Fiyatlandırma", href: "#pricing" },
  { label: "SSS", href: "#faq" },
];

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/60 dark:bg-gray-900/80 dark:border-gray-800/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/edda2b02-c91a-44a1-a2eb-16878c0494fb.png" 
              alt="Flownests Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="font-bold text-xl dark:text-white">Flownests</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className="text-muted-foreground hover:text-primary transition-colors dark:text-gray-400 dark:hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button variant="hero" size="sm" onClick={() => navigate("/login")}>
            Başla
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;