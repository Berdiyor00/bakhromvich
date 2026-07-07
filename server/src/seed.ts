import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  const adminEmail = "admin@hotwalls.uz";
  const adminPasswordHash = await bcrypt.hash("Admin12345", 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Main Admin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN"
    }
  });

  await prisma.siteContent.upsert({
    where: { id: 1 },
    update: {
      heroVideoUrl: "/uploads/hero.mp4"
    },
    create: {
      id: 1,
      companyName: "HOT WALLS 3D",
      heroTitle: "Premium 3D Wall Panels for Modern Interiors",
      heroSubtitle: "Design, production, and installation with architectural precision.",
      heroVideoUrl: "/uploads/hero.mp4",
      aboutTitle: "Architectural Surfaces",
      aboutText: "We create custom decorative wall systems for houses, offices, and commercial spaces. Our team handles concept, fabrication, and installation end-to-end.",
      servicesJson: JSON.stringify([
        { title: "3D Panel Design", description: "Custom visual concepts for your interior." },
        { title: "Production", description: "CNC and precision material manufacturing." },
        { title: "Installation", description: "Turn-key installation by trained experts." }
      ]),
      galleryJson: JSON.stringify([
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200&auto=format&fit=crop"
      ]),
      testimonialsJson: JSON.stringify([
        { name: "Jahongir M.", text: "Installation quality is excellent. The room looks premium." },
        { name: "Madina K.", text: "From design to mounting, everything was fast and clean." }
      ]),
      contactPhone: "+998 90 123 45 67",
      contactEmail: "info@hotwalls.uz",
      contactAddress: "Tashkent, Uzbekistan"
    }
  });

  console.log("Seed completed. Admin login: admin@hotwalls.uz / Admin12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
