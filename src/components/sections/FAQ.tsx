import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    category: "Genel",
    questions: [
      {
        q: "Flownests tam olarak ne yapar?",
        a: "Flownests, B2B satış sürecinizi uçtan uca otomatikleştirir: hedef müşteri tespiti, nitelikli satış toplantılarının planlanması ve fırsatların CRM'e kaydedilmesi dahil tüm adımları anahtar teslim olarak sunar."
      },
      {
        q: "Sloganınız neydi?",
        a: '"Satışı otomatikleştir, büyümeye odaklan."'
      }
    ]
  },
  {
    category: "Hizmet ve işleyiş",
    questions: [
      {
        q: "Hizmet nasıl devreye alınır — ilk adımlar neler?",
        a: "Müşteri web sitemizden hesap açar. Her müşteri için Docker içinde izole bir n8n klonu oluşturulur ve müşteriye özel veriler veritabanında (Supabase) tutulur. Müşteriden kullanacağı üçüncü taraf API anahtarlarını sağlaması istenir (ör. Apollo, Gmail, LinkedIn, Google Maps vb.)."
      },
      {
        q: "Benim yapmam gerekenler/sağlamam gerekenler neler?",
        a: "Hedef kitlenizi belirtmeniz yeterli. Ayrıca kullanılacak üçüncü taraf servislerin (ör. Apollo, Gmail, LinkedIn, Google Maps, vb.) API anahtarları ve bu servisler için oluşacak ücretler müşteriye aittir."
      },
      {
        q: "Otomasyonun teknik altyapısı nedir?",
        a: "Sistem n8n iş akışları, Docker konteynerleri, Supabase veri tabanı ve entegrasyonlar (Apollo, Instantly, Apify, Bright Data, Gmail, LinkedIn, Google Maps API vb.) ile çalışır."
      }
    ]
  },
  {
    category: "Agent takımı ve şeffaflık",
    questions: [
      {
        q: "Agent'lar kimler ve ne iş yapıyorlar?",
        a: "Agent ekibimiz: Eva — Proje direktörü (genel koordinasyon), Leo — Araştırma & lead bulma, Mike — Kampanya yönetimi, Sophie — E-posta kişiselleştirme, Tom — Toplantı asistanı (takvim, hatırlatma), Ash — CRM entegrasyonu ve genel asistan, Clara — Veri analizi. Sistem arayüzünden bu agent'ların görev dağılımını ve birbirleriyle iletişimini izleyebilirsiniz."
      },
      {
        q: "Agent iletişimlerini, süreçleri nasıl takip ederim?",
        a: "Kullanıcı dostu arayüzde agent akışlarını, görev atamalarını ve çalışma geçmişini görebilirsiniz."
      }
    ]
  },
  {
    category: "Fiyatlandırma ve ödeme",
    questions: [
      {
        q: "Ücretlendirme nasıl çalışıyor?",
        a: "Otomasyon sistemi için tek seferlik kurulum/altyapı ücreti uygulanır. Ayrıca aylık bakım ücreti 50 USD'dir. (Tek seferlik kurulum ücreti proje kapsamına göre belirlenir.)"
      },
      {
        q: "Üçüncü taraf hizmetlerin ücretleri dahil mi?",
        a: "Hayır. Apollo, Bright Data, Google Maps vb. üçüncü taraf API'lerin kullanım maliyetleri müşteriye aittir."
      },
      {
        q: "Kişiselleştirme hizmetleri bakım ücretine dahil mi?",
        a: "Hayır. E-posta veya kampanya düzeyindeki ekstra kişiselleştirme hizmetleri aylık bakıma dahil değildir ve ayrı fiyatlandırılır."
      }
    ]
  },
  {
    category: "Güvenlik ve veri yönetimi",
    questions: [
      {
        q: "Verilerim nasıl saklanıyor ve izole mi?",
        a: "Her müşteri için ayrı bir n8n konteyneri ve müşteri-özel veri tabanı alanı oluşturulur. Veriler müşteriye özel olarak tutulur ve izole edilir."
      },
      {
        q: "Yedekleme / veri kaybı durumunda ne oluyor?",
        a: "Altyapı düzeyinde düzenli yedekleme politikamız vardır; acil durumlarda destek talebi ile müdahale edilir. (Detaylı yedekleme/SLA talebiniz varsa bunu teklif aşamasında netleştiririz.)"
      }
    ]
  },
  {
    category: "Destek ve servis",
    questions: [
      {
        q: "Destek nasıl çalışıyor?",
        a: "Sistem arızalandığında web sitesi içindeki geri bildirim formu veya destek e-postası aracılığıyla talep açabilirsiniz. Destek talepleri alındığında ekip müdahale eder ve sorunu giderir."
      },
      {
        q: "SLA (cevap/çözüm süresi) var mı?",
        a: "Standart paket kapsamında destek ve müdahale sağlanır; özel SLA'lar ve hızlandırılmış müdahaleler proje/iş sözleşmesinde ayrıca tanımlanır."
      }
    ]
  },
  {
    category: "Entegrasyonlar ve teknik ayrıntılar",
    questions: [
      {
        q: "Hangi araçlarla entegre oluyorsunuz?",
        a: "n8n, Apollo, Instantly, Bright Data, Supabase, Gmail, LinkedIn, Apify, Google Maps API vb. ile hazır entegrasyonlarımız vardır."
      },
      {
        q: "Mevcut CRM'imle entegre edebilir misiniz?",
        a: "Evet — yaygın CRM'lerle entegrasyon sağlanabilir. Mevcut CRM'iniz özel bir çözümse detaylı teknik inceleme sonrası entegrasyon yapılır."
      },
      {
        q: "Sunucu veya altyapı benim üzerime mi?",
        a: "Hizmet anahtar teslim olarak sunulur; docker konteynerleri sizin veya bizim sağladığımız sunucuda çalışabilir. Genelde müşteriye özel kurulumda sunucu/hosting maliyetleri müşteriye aittir (isteğe göre barındırma opsiyonları teklif aşamasında konuşulur)."
      }
    ]
  },
  {
    category: "Gizlilik ve uyumluluk",
    questions: [
      {
        q: "Kişisel veriler / KVKK / GDPR gibi uyumluluklar nasıl ele alınıyor?",
        a: "Müşteri verileri izole olarak tutulur; kişisel veri işleme ve uyumluluk gereksinimleri proje aşamasında netleştirilir ve sözleşmeye dahil edilir. Özel uyumluluk talepleriniz varsa söyleyin, teklifte belirtelim."
      }
    ]
  },
  {
    category: "Kullanım, demo ve iptal",
    questions: [
      {
        q: "Deneme veya demo var mı?",
        a: "Demo ve canlı gösterim talebinde bulunabilirsiniz — talep edilirse demo oturumu ayarlanır."
      },
      {
        q: "Hizmeti iptal etmek istersem ne oluyor?",
        a: "İptal politikaları sözleşmede belirtilir. Tek seferlik kurulum ücretleri genelde iade kapsamında değildir; aylık bakım ücretleri iptal tarihinden sonra durdurulur. Detayları teklif/sözleşmede netleştiririz."
      }
    ]
  },
  {
    category: "Ölçeklenebilirlik ve özelleştirme",
    questions: [
      {
        q: "Takımım veya hacmim büyürse sistem ölçeklenir mi?",
        a: "Evet — n8n + Docker yapısı ve modüler agent mimarisi ile ölçekleme sağlanır. Artan iş yükü ve ek entegrasyonlar proje bazlı tekrar fiyatlandırılır."
      },
      {
        q: "Raporlama/analiz alabilir miyim?",
        a: "Evet — Clara (data analiz) agent'ı sayesinde lead ve kampanya performansı raporları sunulur; özel rapor talepleri ayrı olarak konfigüre edilir."
      }
    ]
  }
];

const FAQ: React.FC = () => {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="container py-20">
      <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold text-center mb-10 dark:text-white">
        SSS — Flownests
      </h2>
      
      <div className="max-w-4xl mx-auto">
        {faqData.map((category, idx) => (
          <div key={idx} className="mb-8">
            <h3 className="text-xl font-semibold text-primary mb-4 dark:text-blue-400">{category.category}</h3>
            <Accordion type="single" collapsible className="space-y-2">
              {category.questions.map((item, qIdx) => (
                <AccordionItem 
                  key={qIdx} 
                  value={`${idx}-${qIdx}`}
                  className="bg-card/60 border border-border/60 rounded-lg px-4 dark:bg-gray-800/60 dark:border-gray-700/60"
                >
                  <AccordionTrigger className="hover:no-underline dark:text-white">
                    <span className="text-left font-medium">{item.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed dark:text-gray-400">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;