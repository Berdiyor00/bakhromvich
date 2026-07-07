export interface ServiceItem {
  title: string;
  description: string;
}

export interface TestimonialItem {
  name: string;
  text: string;
}

export interface GalleryItemData {
  url: string;
  type: "image" | "video";
  title?: string;
  slug?: string;
  category?: string;
  summary?: string;
  description?: string;
  images?: string[];
}

export interface FooterOffice {
  city: string;
  address: string;
}

export interface FooterSocialLink {
  label: string;
  url: string;
}

export interface FooterContent {
  offices: FooterOffice[];
  phone: string;
  email: string;
  telegramUrl: string;
  whatsappUrl: string;
  socialLinks: FooterSocialLink[];
  policyLabel: string;
  policyUrl: string;
  copyright: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  heroImage: string;
  gallery: string[];
}

export interface SiteContent {
  id: number;
  companyName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl: string;
  aboutTitle: string;
  aboutText: string;
  servicesJson: string;
  galleryJson: string;
  testimonialsJson: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactTelegram: string;
  contactInstagram: string;
  contactExtraLabel: string;
  contactExtraUrl: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | string;
  createdAt: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | string;
}
