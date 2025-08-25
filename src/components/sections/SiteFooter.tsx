import React from "react";
import { useNavigate } from "react-router-dom";

const SiteFooter: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="container px-4 py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-lg font-bold mb-2">Orkestra</div>
          <p className="text-muted-foreground">Anahtar teslim B2B satış otomasyon platformu.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Ürün</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><button className="story-link" onClick={() => navigate("#features")}>Özellikler</button></li>
            <li><button className="story-link" onClick={() => navigate("#integrations")}>Entegrasyonlar</button></li>
            <li><button className="story-link" onClick={() => navigate("#pricing")}>Fiyatlandırma</button></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Kaynaklar</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><a className="story-link" href="#">Blog</a></li>
            <li><a className="story-link" href="#">Dokümantasyon</a></li>
            <li><a className="story-link" href="#">Destek</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Şirket</div>
          <ul className="space-y-1 text-muted-foreground">
            <li><a className="story-link" href="#">Hakkımızda</a></li>
            <li><a className="story-link" href="#">İletişim</a></li>
            <li><a className="story-link" href="#">Gizlilik</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Orkestra. Tüm hakları saklıdır.
      </div>
    </footer>
  );
};

export default SiteFooter;