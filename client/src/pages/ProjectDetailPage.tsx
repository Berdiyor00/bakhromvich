import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_BASE_URL } from "../api/client";
import type { GalleryItemData, SiteContent } from "../types";

const isAbsoluteMediaUrl = (url: string) => url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:");

const resolveMediaUrl = (url: string) => {
  if (!url || isAbsoluteMediaUrl(url)) return url;
  return `${API_BASE_URL}${url}`;
};

const parseGallery = (galleryJson: string): GalleryItemData[] => {
  try {
    const parsed = JSON.parse(galleryJson) as Array<string | Partial<GalleryItemData>>;
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => {
      if (typeof item === "string") {
        return {
          url: resolveMediaUrl(item),
          type: /\.(mp4|webm|ogg)(\?|#|$)/i.test(item) ? "video" : "image"
        };
      }

      return {
        url: resolveMediaUrl(item.url ?? ""),
        type: item.type === "video" ? "video" : "image",
        title: item.title,
        slug: item.slug,
        category: item.category,
        summary: item.summary,
        description: item.description,
        images: Array.isArray(item.images) ? item.images.map(resolveMediaUrl) : []
      };
    });
  } catch {
    return [];
  }
};

export default function ProjectDetailPage() {
  const { slug = "" } = useParams();
  const [content, setContent] = useState<SiteContent | null>(null);

  useEffect(() => {
    api.get<SiteContent>("/public/content").then((res) => setContent(res.data)).catch(() => setContent(null));
  }, []);

  const project = useMemo(() => {
    if (!content) return null;
    return parseGallery(content.galleryJson).find((item) => item.slug === slug) ?? null;
  }, [content, slug]);

  if (!project) {
    return (
      <div className="detail-page page-container">
        <Link className="detail-back" to="/">Bosh sahifaga qaytish</Link>
        <h1>Loyiha topilmadi</h1>
      </div>
    );
  }

  const detailImages = project.images?.length ? project.images : [project.url];

  return (
    <div className="detail-page page-container">
      <Link className="detail-back" to="/">Bosh sahifaga qaytish</Link>

      <section className="detail-hero">
        <div>
          <p className="detail-kicker">{project.category ?? "Loyiha"}</p>
          <h1>{project.title ?? "Loyiha"}</h1>
          <p>{project.description ?? project.summary ?? "Tanlangan loyiha haqida batafsil ma'lumot."}</p>
        </div>
        <img src={project.url} alt={project.title ?? "Loyiha rasmi"} />
      </section>

      <section className="detail-gallery-grid">
        {detailImages.map((image, index) => (
          <figure key={`${image}-${index}`} className="detail-gallery-card">
            <img src={image} alt={`${project.title ?? "Loyiha"} ${index + 1}`} />
          </figure>
        ))}
      </section>
    </div>
  );
}