export interface ServiceItem {
  title: string;
  description: string;
}

export interface TestimonialItem {
  name: string;
  text: string;
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
