import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_BASE_URL } from "../api/client";
import type { CustomPage } from "../types";

const resolveMediaUrl = (url: string) => {
  if (!url || url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${API_BASE_URL}${url}`;
};

export default function CustomPageView() {
  const { slug = "" } = useParams();
  const [page, setPage] = useState<CustomPage | null>(null);

  useEffect(() => {
    api.get<CustomPage>(`/public/pages/${slug}`).then((res) => setPage(res.data)).catch(() => setPage(null));
  }, [slug]);

  if (!page) {
    return (
      <div className="detail-page page-container">
        <Link className="detail-back" to="/">Bosh sahifaga qaytish</Link>
        <h1>Sahifa topilmadi</h1>
      </div>
    );
  }

  return (
    <div className="detail-page page-container">
      <Link className="detail-back" to="/">Bosh sahifaga qaytish</Link>

      <section className="detail-hero">
        <div>
          <p className="detail-kicker">Custom Page</p>
          <h1>{page.title}</h1>
          <p>{page.excerpt}</p>
        </div>
        {page.heroImage ? <img src={resolveMediaUrl(page.heroImage)} alt={page.title} /> : null}
      </section>

      <section className="detail-content-card">
        <p>{page.content}</p>
      </section>

      {page.gallery.length ? (
        <section className="detail-gallery-grid">
          {page.gallery.map((image, index) => (
            <figure key={`${image}-${index}`} className="detail-gallery-card">
              <img src={resolveMediaUrl(image)} alt={`${page.title} ${index + 1}`} />
            </figure>
          ))}
        </section>
      ) : null}
    </div>
  );
}