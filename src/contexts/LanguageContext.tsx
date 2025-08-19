import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Dil çeviri objesi
const translations = {
  tr: {
    // CRM Modülü - Contacts
    'crm.contacts.title': 'Kişiler',
    'crm.contacts.total': 'toplam kişi',
    'crm.contacts.addNew': 'Yeni Kişi',
    'crm.contacts.searchPlaceholder': 'Kişi, e-posta veya şirket ara...',
    'crm.contacts.allStages': 'Tüm Aşamalar',
    'crm.contacts.lead': 'Lead',
    'crm.contacts.mql': 'MQL',
    'crm.contacts.sql': 'SQL',
    'crm.contacts.customer': 'Müşteri',
    'crm.contacts.table.contact': 'Kişi',
    'crm.contacts.table.company': 'Şirket',
    'crm.contacts.table.stage': 'Aşama',
    'crm.contacts.table.contactInfo': 'İletişim',
    'crm.contacts.table.created': 'Oluşturulma',
    'crm.contacts.table.actions': 'İşlemler',
    'crm.contacts.noContacts': 'Kişi bulunamadı',
    'crm.contacts.noContactsSearch': 'Arama kriterlerinize uygun kişi bulunamadı.',
    'crm.contacts.noContactsYet': 'Henüz hiç kişi eklenmemiş.',
    'crm.contacts.addFirst': 'İlk Kişiyi Ekle',
    'crm.contacts.addContact': 'Yeni Kişi Ekle',
    'crm.contacts.editContact': 'Kişiyi Düzenle',
    'crm.contacts.fullName': 'Ad Soyad',
    'crm.contacts.email': 'E-posta',
    'crm.contacts.phone': 'Telefon',
    'crm.contacts.titleField': 'Pozisyon',
    'crm.contacts.company': 'Şirket',
    'crm.contacts.stage': 'Aşama',
    'crm.contacts.notes': 'Notlar',
    'crm.contacts.cancel': 'İptal',
    'crm.contacts.save': 'Kaydet',
    'crm.contacts.update': 'Güncelle',
    'crm.contacts.deleteConfirm': ' kişisini silmek istediğinizden emin misiniz?',
    
    // CRM Modülü - Companies
    'crm.companies.title': 'Şirketler',
    'crm.companies.total': 'toplam şirket',
    'crm.companies.addNew': 'Yeni Şirket',
    'crm.companies.searchPlaceholder': 'Şirket adı, domain veya sektör ara...',
    'crm.companies.noCompanies': 'Şirket bulunamadı',
    'crm.companies.noCompaniesSearch': 'Arama kriterlerinize uygun şirket bulunamadı.',
    'crm.companies.noCompaniesYet': 'Henüz hiç şirket eklenmemiş.',
    'crm.companies.addFirst': 'İlk Şirketi Ekle',
    'crm.companies.addCompany': 'Yeni Şirket Ekle',
    'crm.companies.editCompany': 'Şirketi Düzenle',
    'crm.companies.name': 'Şirket Adı',
    'crm.companies.domain': 'Domain',
    'crm.companies.domainPlaceholder': 'örn: company.com',
    'crm.companies.industry': 'Sektör',
    'crm.companies.location': 'Konum',
    'crm.companies.size': 'Çalışan Sayısı',
    'crm.companies.sizePlaceholder': 'örn: 50, 1-10, 100+',
    'crm.companies.website': 'Website',
    'crm.companies.websitePlaceholder': 'https://www.company.com',
    'crm.companies.phone': 'Telefon',
    'crm.companies.description': 'Açıklama',
    'crm.companies.employees': 'çalışan',
    'crm.companies.created': 'Oluşturulma',
    'crm.companies.cancel': 'İptal',
    'crm.companies.save': 'Kaydet',
    'crm.companies.update': 'Güncelle',
    'crm.companies.deleteConfirm': ' şirketini silmek istediğinizden emin misiniz?',
    
    // CRM Modülü - Deals
    'crm.deals.title': 'Fırsatlar',
    'crm.deals.total': 'toplam fırsat',
    'crm.deals.addNew': 'Yeni Fırsat',
    'crm.deals.searchPlaceholder': 'Fırsat, kişi veya şirket ara...',
    'crm.deals.allStatuses': 'Tüm Durumlar',
    'crm.deals.noDeals': 'Fırsat bulunamadı',
    'crm.deals.noDealsSearch': 'Arama kriterlerinize uygun fırsat bulunamadı.',
    'crm.deals.noDealsYet': 'Henüz hiç fırsat eklenmemiş.',
    'crm.deals.addFirst': 'İlk Fırsatı Ekle',
    'crm.deals.addDeal': 'Yeni Fırsat Ekle',
    'crm.deals.editDeal': 'Fırsatı Düzenle',
    'crm.deals.titleField': 'Fırsat Başlığı',
    'crm.deals.value': 'Değer',
    'crm.deals.currency': 'Para Birimi',
    'crm.deals.contact': 'Kişi',
    'crm.deals.company': 'Şirket',
    'crm.deals.stage': 'Pipeline Aşaması',
    'crm.deals.closeDate': 'Kapanış Tarihi',
    'crm.deals.status.label': 'Durum',
    'crm.deals.status.open': 'Aktif',
    'crm.deals.status.won': 'Kazanıldı',
    'crm.deals.status.lost': 'Kaybedildi',
    'crm.deals.source': 'Kaynak',
    'crm.deals.source.placeholder': 'Website, Referans, vb.',
    'crm.deals.description': 'Açıklama',
    'crm.deals.cancel': 'İptal',
    'crm.deals.save': 'Kaydet',
    'crm.deals.update': 'Güncelle',
    'crm.deals.deleteConfirm': ' fırsatını silmek istediğinizden emin misiniz?',
    'crm.deals.table.deal': 'Fırsat',
    'crm.deals.table.contactCompany': 'Kişi/Şirket',
    'crm.deals.table.stage': 'Aşama',
    'crm.deals.table.value': 'Değer',
    'crm.deals.table.status': 'Durum',
    'crm.deals.table.closeDate': 'Kapanış Tarihi',
    'crm.deals.table.actions': 'İşlemler',
    'crm.deals.stage.notSpecified': 'Belirtilmemiş',
    'crm.deals.stage.probability': 'olasılık',
    'crm.deals.stage.select': 'Aşama Seçin',
    'crm.deals.contact.select': 'Kişi Seçin',
    'crm.deals.company.select': 'Şirket Seçin',
    'crm.deals.closeDate.notSpecified': 'Belirtilmemiş',
    'crm.deals.stats.totalValue': 'Toplam Değer',
    'crm.deals.stats.active': 'Aktif Fırsatlar',
    'crm.deals.stats.won': 'Kazanılan',
    
    // CRM Modülü - Dashboard
    'crm.dashboard.title': 'CRM Dashboard',
    'crm.dashboard.description': 'Satış performansınızın genel görünümü',
    'crm.dashboard.search.placeholder': 'Kişi, şirket veya fırsat ara...',
    'crm.dashboard.search.contacts': 'Kişiler',
    'crm.dashboard.search.companies': 'Şirketler',
    'crm.dashboard.search.deals': 'Fırsatlar',
    'crm.dashboard.search.unknown': 'Bilinmeyen',
    'crm.dashboard.stats.contacts': 'Toplam Kişiler',
    'crm.dashboard.stats.companies': 'Şirketler',
    'crm.dashboard.stats.activeDeals': 'Aktif Fırsatlar',
    'crm.dashboard.stats.totalValue': 'Toplam Değer',
    'crm.dashboard.pipeline.title': 'Pipeline Aşamaları',
    'crm.dashboard.pipeline.deals': 'fırsat',
    'crm.dashboard.pipeline.noActive': 'Henüz aktif pipeline aşaması bulunmuyor',
    'crm.dashboard.pipeline.createFirst': 'İlk fırsatınızı oluşturun',
    'crm.dashboard.pipeline.notSpecified': 'Belirtilmemiş',
    'crm.dashboard.recentDeals.title': 'Son Fırsatlar',
    'crm.dashboard.recentDeals.viewAll': 'Tümünü Gör',
    'crm.dashboard.recentDeals.noDeals': 'Henüz fırsat bulunmuyor',
    'crm.dashboard.recentDeals.createFirst': 'İlk fırsatınızı oluşturun',
    'crm.dashboard.quickActions.title': 'Hızlı İşlemler',
    'crm.dashboard.quickActions.addContact': 'Yeni Kişi Ekle',
    'crm.dashboard.quickActions.addCompany': 'Yeni Şirket Ekle',
    'crm.dashboard.quickActions.addDeal': 'Yeni Fırsat Ekle',
    'crm.dashboard.performance.title': 'Performans Özeti',
    'crm.dashboard.performance.winRate': 'Kazanma Oranı',
    'crm.dashboard.performance.avgDealValue': 'Ortalama Fırsat Değeri',
    'crm.dashboard.performance.activePipeline': 'Aktif Pipeline',
    
    // Genel terimler
    'general.delete': 'Sil',
    'general.edit': 'Düzenle',
    'general.name': 'Ad',
    'general.email': 'E-posta',
    'general.company': 'Şirket',
    'general.required': 'Bu alan zorunludur',
    'general.select': 'Seçin'
  },
  en: {
    // CRM Module - Contacts
    'crm.contacts.title': 'Contacts',
    'crm.contacts.total': 'total contacts',
    'crm.contacts.addNew': 'Add New Contact',
    'crm.contacts.searchPlaceholder': 'Search contact, email or company...',
    'crm.contacts.allStages': 'All Stages',
    'crm.contacts.lead': 'Lead',
    'crm.contacts.mql': 'MQL',
    'crm.contacts.sql': 'SQL',
    'crm.contacts.customer': 'Customer',
    'crm.contacts.table.contact': 'Contact',
    'crm.contacts.table.company': 'Company',
    'crm.contacts.table.stage': 'Stage',
    'crm.contacts.table.contactInfo': 'Contact Info',
    'crm.contacts.table.created': 'Created',
    'crm.contacts.table.actions': 'Actions',
    'crm.contacts.noContacts': 'No contacts found',
    'crm.contacts.noContactsSearch': 'No contacts match your search criteria.',
    'crm.contacts.noContactsYet': 'No contacts have been added yet.',
    'crm.contacts.addFirst': 'Add First Contact',
    'crm.contacts.addContact': 'Add New Contact',
    'crm.contacts.editContact': 'Edit Contact',
    'crm.contacts.fullName': 'Full Name',
    'crm.contacts.email': 'Email',
    'crm.contacts.phone': 'Phone',
    'crm.contacts.titleField': 'Title',
    'crm.contacts.company': 'Company',
    'crm.contacts.stage': 'Stage',
    'crm.contacts.notes': 'Notes',
    'crm.contacts.cancel': 'Cancel',
    'crm.contacts.save': 'Save',
    'crm.contacts.update': 'Update',
    'crm.contacts.deleteConfirm': 'Are you sure you want to delete ',
    
    // CRM Module - Companies
    'crm.companies.title': 'Companies',
    'crm.companies.total': 'total companies',
    'crm.companies.addNew': 'Add New Company',
    'crm.companies.searchPlaceholder': 'Search company name, domain or industry...',
    'crm.companies.noCompanies': 'No companies found',
    'crm.companies.noCompaniesSearch': 'No companies match your search criteria.',
    'crm.companies.noCompaniesYet': 'No companies have been added yet.',
    'crm.companies.addFirst': 'Add First Company',
    'crm.companies.addCompany': 'Add New Company',
    'crm.companies.editCompany': 'Edit Company',
    'crm.companies.name': 'Company Name',
    'crm.companies.domain': 'Domain',
    'crm.companies.domainPlaceholder': 'e.g.: company.com',
    'crm.companies.industry': 'Industry',
    'crm.companies.location': 'Location',
    'crm.companies.size': 'Employee Count',
    'crm.companies.sizePlaceholder': 'e.g.: 50, 1-10, 100+',
    'crm.companies.website': 'Website',
    'crm.companies.websitePlaceholder': 'https://www.company.com',
    'crm.companies.phone': 'Phone',
    'crm.companies.description': 'Description',
    'crm.companies.employees': 'employees',
    'crm.companies.created': 'Created',
    'crm.companies.cancel': 'Cancel',
    'crm.companies.save': 'Save',
    'crm.companies.update': 'Update',
    'crm.companies.deleteConfirm': 'Are you sure you want to delete ',
    
    // CRM Module - Deals
    'crm.deals.title': 'Deals',
    'crm.deals.total': 'total deals',
    'crm.deals.addNew': 'Add New Deal',
    'crm.deals.searchPlaceholder': 'Search deal, contact or company...',
    'crm.deals.allStatuses': 'All Statuses',
    'crm.deals.noDeals': 'No deals found',
    'crm.deals.noDealsSearch': 'No deals match your search criteria.',
    'crm.deals.noDealsYet': 'No deals have been added yet.',
    'crm.deals.addFirst': 'Add First Deal',
    'crm.deals.addDeal': 'Add New Deal',
    'crm.deals.editDeal': 'Edit Deal',
    'crm.deals.titleField': 'Deal Title',
    'crm.deals.value': 'Value',
    'crm.deals.currency': 'Currency',
    'crm.deals.contact': 'Contact',
    'crm.deals.company': 'Company',
    'crm.deals.stage': 'Pipeline Stage',
    'crm.deals.closeDate': 'Close Date',
    'crm.deals.status.label': 'Status',
    'crm.deals.status.open': 'Open',
    'crm.deals.status.won': 'Won',
    'crm.deals.status.lost': 'Lost',
    'crm.deals.source': 'Source',
    'crm.deals.source.placeholder': 'Website, Referral, etc.',
    'crm.deals.description': 'Description',
    'crm.deals.cancel': 'Cancel',
    'crm.deals.save': 'Save',
    'crm.deals.update': 'Update',
    'crm.deals.deleteConfirm': 'Are you sure you want to delete ',
    'crm.deals.table.deal': 'Deal',
    'crm.deals.table.contactCompany': 'Contact/Company',
    'crm.deals.table.stage': 'Stage',
    'crm.deals.table.value': 'Value',
    'crm.deals.table.status': 'Status',
    'crm.deals.table.closeDate': 'Close Date',
    'crm.deals.table.actions': 'Actions',
    'crm.deals.stage.notSpecified': 'Not specified',
    'crm.deals.stage.probability': 'probability',
    'crm.deals.stage.select': 'Select Stage',
    'crm.deals.contact.select': 'Select Contact',
    'crm.deals.company.select': 'Select Company',
    'crm.deals.closeDate.notSpecified': 'Not specified',
    'crm.deals.stats.totalValue': 'Total Value',
    'crm.deals.stats.active': 'Active Deals',
    'crm.deals.stats.won': 'Won',
    
    // CRM Module - Dashboard
    'crm.dashboard.title': 'CRM Dashboard',
    'crm.dashboard.description': 'Overview of your sales performance',
    'crm.dashboard.search.placeholder': 'Search contact, company or deal...',
    'crm.dashboard.search.contacts': 'Contacts',
    'crm.dashboard.search.companies': 'Companies',
    'crm.dashboard.search.deals': 'Deals',
    'crm.dashboard.search.unknown': 'Unknown',
    'crm.dashboard.stats.contacts': 'Total Contacts',
    'crm.dashboard.stats.companies': 'Companies',
    'crm.dashboard.stats.activeDeals': 'Active Deals',
    'crm.dashboard.stats.totalValue': 'Total Value',
    'crm.dashboard.pipeline.title': 'Pipeline Stages',
    'crm.dashboard.pipeline.deals': 'deals',
    'crm.dashboard.pipeline.noActive': 'No active pipeline stages yet',
    'crm.dashboard.pipeline.createFirst': 'Create your first deal',
    'crm.dashboard.pipeline.notSpecified': 'Not specified',
    'crm.dashboard.recentDeals.title': 'Recent Deals',
    'crm.dashboard.recentDeals.viewAll': 'View All',
    'crm.dashboard.recentDeals.noDeals': 'No deals yet',
    'crm.dashboard.recentDeals.createFirst': 'Create your first deal',
    'crm.dashboard.quickActions.title': 'Quick Actions',
    'crm.dashboard.quickActions.addContact': 'Add New Contact',
    'crm.dashboard.quickActions.addCompany': 'Add New Company',
    'crm.dashboard.quickActions.addDeal': 'Add New Deal',
    'crm.dashboard.performance.title': 'Performance Summary',
    'crm.dashboard.performance.winRate': 'Win Rate',
    'crm.dashboard.performance.avgDealValue': 'Avg. Deal Value',
    'crm.dashboard.performance.activePipeline': 'Active Pipeline',
    
    // General terms
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.name': 'Name',
    'general.email': 'Email',
    'general.company': 'Company',
    'general.required': 'This field is required',
    'general.select': 'Select'
  }
};

interface LanguageContextType {
  language: 'tr' | 'en';
  setLanguage: (language: 'tr' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'en') {
      setLanguage('en');
    }
  }, []);

  const updateLanguage = (newLanguage: 'tr' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}