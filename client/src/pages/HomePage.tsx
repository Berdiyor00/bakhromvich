import { useEffect, useMemo, useState } from "react";
import { api, API_BASE_URL } from "../api/client";
import ThreeBackdrop from "../components/ThreeBackdrop";
import type { ServiceItem, SiteContent, TestimonialItem } from "../types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const FALLBACK_CONTENT: SiteContent = {
  id: 0,
  companyName: "HOT WALLS",
  heroTitle: "Zamonaviy Issiqlik Va Fasad Yechimlari",
  heroSubtitle: "Premium dizayn, mustahkam material va professional montaj.",
  heroVideoUrl: "",
  aboutTitle: "Biz Haqimizda",
  aboutText: "Sayt vaqtincha oflayn API holatida ishlamoqda. Tez orada to'liq ma'lumotlar tiklanadi.",
  servicesJson: JSON.stringify([
    { title: "Fasad Panellari", description: "Bardoshli va estetik tashqi qoplama yechimlari." },
    { title: "Issiqlik Izolyatsiyasi", description: "Energiya tejamkor va uzoq muddatli izolyatsiya." },
    { title: "Professional Montaj", description: "Mutaxassislar tomonidan tez va sifatli o'rnatish." }
  ]),
  galleryJson: "[]",
  testimonialsJson: JSON.stringify([
    { name: "Mijoz", text: "Xizmat sifati yuqori, natija a'lo darajada." }
  ]),
  contactPhone: "+998 90 000 00 00",
  contactEmail: "info@hotwalls.uz",
  contactAddress: "Toshkent, O'zbekiston",
  updatedAt: new Date().toISOString()
};

const isSiteContent = (value: unknown): value is SiteContent => {
  if (!value || typeof value !== "object") return false;

  const content = value as Partial<SiteContent>;
  return (
    typeof content.companyName === "string" &&
    typeof content.heroTitle === "string" &&
    typeof content.heroSubtitle === "string" &&
    typeof content.heroVideoUrl === "string" &&
    typeof content.aboutTitle === "string" &&
    typeof content.aboutText === "string" &&
    typeof content.servicesJson === "string" &&
    typeof content.galleryJson === "string" &&
    typeof content.testimonialsJson === "string"
  );
};

type GalleryItem =
  | string
  | {
      url: string;
      type?: "image" | "video";
    };

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);

const isDirectHeroVideoUrl = (url: string) => /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i.test(url);

const resolveMediaUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const resolveHeroVideoUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

const getEmbedVideoUrl = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl);

    if (url.hostname.includes("youtu.be") || url.hostname.includes("youtube.com")) {
      let videoId = "";

      if (url.hostname.includes("youtu.be")) {
        videoId = url.pathname.replace("/", "");
      } else if (url.pathname.startsWith("/shorts/")) {
        videoId = url.pathname.split("/")[2] ?? "";
      } else if (url.pathname.startsWith("/embed/")) {
        videoId = url.pathname.split("/")[2] ?? "";
      } else {
        videoId = url.searchParams.get("v") ?? "";
      }

      if (!videoId) return null;
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0`;
    }

    if (url.hostname.includes("vimeo.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const videoId = parts[parts.length - 1];
      if (!videoId) return null;
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&background=1&loop=1`;
    }

    return null;
  } catch {
    return null;
  }
};

const normalizeGalleryItem = (item: GalleryItem) => {
  if (typeof item === "string") {
    return {
      url: resolveMediaUrl(item),
      type: isVideoUrl(item) ? ("video" as const) : ("image" as const)
    };
  }

  return {
    url: resolveMediaUrl(item.url),
    type: item.type ?? (isVideoUrl(item.url) ? ("video" as const) : ("image" as const))
  };
};

export default function HomePage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;

    api
      .get<SiteContent>("/public/content")
      .then((res) => {
        if (!isMounted) return;
        setContent(isSiteContent(res.data) ? res.data : FALLBACK_CONTENT);
      })
      .catch(() => {
        if (!isMounted) return;
        setContent(FALLBACK_CONTENT);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      setScrollProgress(Math.min(1, window.scrollY / maxScroll));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    elements.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${index * 70}ms`);
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [content]);

  const services = useMemo(() => {
    if (!content) return [];
    try {
      return JSON.parse(content.servicesJson) as ServiceItem[];
    } catch {
      return [];
    }
  }, [content]);

  const gallery = useMemo(() => {
    if (!content) return [];
    try {
      return JSON.parse(content.galleryJson) as GalleryItem[];
    } catch {
      return [];
    }
  }, [content]);

  const testimonials = useMemo(() => {
    if (!content) return [];
    try {
      return JSON.parse(content.testimonialsJson) as TestimonialItem[];
    } catch {
      return [];
    }
  }, [content]);

  if (!content) {
    return <div className="loading">Loading...</div>;
  }

  const heroVideoUrl = resolveHeroVideoUrl((content.heroVideoUrl ?? "").trim());
  const isDirectHeroVideo = isDirectHeroVideoUrl(heroVideoUrl);
  const heroEmbedUrl = !isDirectHeroVideo ? getEmbedVideoUrl(heroVideoUrl) : null;

  return (
    <div className="page">
      <header className="hero-header">
        {isDirectHeroVideo ? (
          <video className="hero-video" autoPlay muted loop playsInline>
            <source src={heroVideoUrl} />
          </video>
        ) : heroEmbedUrl ? (
          <div className="hero-video hero-embed-wrap">
            <iframe
              className="hero-embed-frame"
              src={heroEmbedUrl}
              title="Hero Video"
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <span className="hero-embed-mask hero-embed-mask-top" />
            <span className="hero-embed-mask hero-embed-mask-bottom" />
          </div>
        ) : null}
        <div className="overlay" />
        <ThreeBackdrop scrollProgress={scrollProgress} />
        <div className="hero-nav-shell">
          <div className="page-container">
            <nav className="top-nav">
              <a className="brand" href="/" aria-label={content.companyName}>
                <span className="brand-mark" />
                <span className="brand-text">{content.companyName}</span>
              </a>

              <div className="nav-links">
                <a href="#services">Xizmatlar</a>
                <a href="#gallery">Galereya</a>
                <a href="#contact">Aloqa</a>
              </div>

              <a className="nav-cta" href="/login">
                Login
              </a>

              <button
                className={`burger-button${menuOpen ? " is-open" : ""}`}
                type="button"
                aria-label="Menyu"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen((value) => !value)}
              >
                <span />
                <span />
                <span />
              </button>

              {menuOpen ? (
                <div className="mobile-menu" id="mobile-nav">
                  <a href="#services" onClick={() => setMenuOpen(false)}>Xizmatlar</a>
                  <a href="#gallery" onClick={() => setMenuOpen(false)}>Galereya</a>
                  <a href="#contact" onClick={() => setMenuOpen(false)}>Aloqa</a>
                  <a href="/login" onClick={() => setMenuOpen(false)}>Login</a>
                </div>
              ) : null}
            </nav>
          </div>
        </div>
        <div className="hero-content-shell">
          <div className="page-container">
            <div className="hero-text reveal-up is-visible" data-reveal>
              <h1>{content.heroTitle}</h1>
              <p>{content.heroSubtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="page-container">
        <section className="about section reveal-up" data-reveal>
          <h2>{content.aboutTitle}</h2>
          <p>{content.aboutText}</p>
        </section>

        <section id="services" className="section card-grid reveal-up" data-reveal>
          {services.map((service) => (
            <article key={service.title} className="glass-card reveal-up" data-reveal>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </section>

        <section id="gallery" className="section gallery-section reveal-up" data-reveal>
          <div className="section-heading reveal-up" data-reveal>
            <h2>Galereya</h2>
          </div>

          <Swiper
            className="gallery-swiper"
            modules={[Autoplay, Pagination]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            rewind
            grabCursor
            simulateTouch
            allowTouchMove
            speed={700}
            spaceBetween={18}
            slidesPerView={1}
            breakpoints={{
              700: { slidesPerView: 2 },
              1100: { slidesPerView: 3 }
            }}
          >
            {gallery.map((item, idx) => {
              const media = normalizeGalleryItem(item);

              return (
                <SwiperSlide key={`${media.url}-${idx}`}>
                  <div className="gallery-slide reveal-up" data-reveal>
                    {media.type === "video" ? (
                      <video className="gallery-media" autoPlay muted loop playsInline preload="metadata">
                        <source src={media.url} />
                      </video>
                    ) : (
                      <img className="gallery-media" src={media.url} alt={`project-${idx + 1}`} />
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </section>

        <section className="section testimonials reveal-up" data-reveal>
          {testimonials.map((item, idx) => (
            <blockquote key={`${item.name}-${idx}`} className="reveal-up" data-reveal>
              <p>{item.text}</p>
              <footer>{item.name}</footer>
            </blockquote>
          ))}
        </section>

        <section id="contact" className="section contact reveal-up" data-reveal>
          <h2>Biz bilan bog'laning</h2>
          <p>{content.contactPhone}</p>
          <p>{content.contactEmail}</p>
          <p>{content.contactAddress}</p>
        </section>
      </main>
    </div>
  );
}
