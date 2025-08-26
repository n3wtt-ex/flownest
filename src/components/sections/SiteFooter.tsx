import React from "react";

const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-border/60 bg-background/60 dark:bg-gray-900/60 dark:border-gray-700/60">
      <div className="container py-12 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-lg font-bold mb-2 dark:text-white">flownests</div>
          <p className="text-muted-foreground dark:text-gray-400">Anahtar teslim B2B satış otomasyon platformu.</p>
        </div>
        <div>
          <div className="font-semibold mb-2 dark:text-white">Ürün</div>
          <ul className="space-y-1 text-muted-foreground dark:text-gray-400">
            <li><a className="story-link" href="#features">Özellikler</a></li>
            <li><a className="story-link" href="#integrations">Entegrasyonlar</a></li>
            <li><a className="story-link" href="#pricing">Fiyatlandırma</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 dark:text-white">Kaynaklar</div>
          <ul className="space-y-1 text-muted-foreground dark:text-gray-400">
            <li><a className="story-link" href="#">Blog</a></li>
            <li><a className="story-link" href="#">Dokümantasyon</a></li>
            <li><a className="story-link" href="#">Destek</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2 dark:text-white">Şirket</div>
          <ul className="space-y-1 text-muted-foreground dark:text-gray-400">
            <li><a className="story-link" href="#">Hakkımızda</a></li>
            <li><a className="story-link" href="#">İletişim</a></li>
            <li><a className="story-link" href="#">Gizlilik</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 dark:border-gray-700/60 py-6 text-center text-xs text-muted-foreground dark:text-gray-500">
        © {new Date().getFullYear()} flownests. Tüm hakları saklıdır.
      </div>
    </footer>
  );
};

export default SiteFooter;