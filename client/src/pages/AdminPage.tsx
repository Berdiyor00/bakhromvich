import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api, API_BASE_URL } from "../api/client";
import type { CustomPage, FooterContent, GalleryItemData, ServiceItem, SiteContent, TestimonialItem, User } from "../types";

type GalleryEntry = GalleryItemData;
type InputMode = "url" | "upload";
type ProjectImportMode = "link" | "file";
type GalleryImportPayload = Partial<GalleryEntry> & {
  extraImages?: string[];
};

const emptyContent: Omit<SiteContent, "updatedAt"> = {
  id: 1,
  companyName: "",
  heroTitle: "",
  heroSubtitle: "",
  heroVideoUrl: "",
  aboutTitle: "",
  aboutText: "",
  servicesJson: "[]",
  galleryJson: "[]",
  testimonialsJson: "[]",
  contactPhone: "",
  contactEmail: "",
  contactAddress: ""
};
const emptyFooter: FooterContent = {
  offices: [
    { city: "", address: "" },
    { city: "", address: "" }
  ],
  phone: "",
  email: "",
  telegramUrl: "",
  whatsappUrl: "",
  socialLinks: [
    { label: "", url: "" },
    { label: "", url: "" }
  ],
  policyLabel: "",
  policyUrl: "",
  copyright: ""
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const parseLines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);


export default function AdminPage() {
  const [content, setContent] = useState(emptyContent);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [footer, setFooter] = useState<FooterContent>(emptyFooter);
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [galleryMainMode, setGalleryMainMode] = useState<Record<number, InputMode>>({});
  const [galleryExtraMode, setGalleryExtraMode] = useState<Record<number, InputMode>>({});
  const [pageHeroMode, setPageHeroMode] = useState<Record<number, InputMode>>({});
  const [pageGalleryMode, setPageGalleryMode] = useState<Record<number, InputMode>>({});
  const [projectImportMode, setProjectImportMode] = useState<ProjectImportMode>("link");
  const [projectJsonUrl, setProjectJsonUrl] = useState("");
  const primitiveFilled = [
    content.companyName,
    content.heroTitle,
    content.heroSubtitle,
    content.aboutTitle,
    content.aboutText,
    content.contactPhone,
    content.contactEmail,
    content.contactAddress
  ].filter((item) => item.trim().length > 0).length;

  const completedFields = primitiveFilled + (services.length > 0 ? 1 : 0) + (gallery.length > 0 ? 1 : 0) + (testimonials.length > 0 ? 1 : 0) + (pages.length > 0 ? 1 : 0);
  const saveReady = completedFields >= 10;

  const parseServices = (servicesJson: string) => {
    try {
      const parsed = JSON.parse(servicesJson) as ServiceItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseTestimonials = (testimonialsJson: string) => {
    try {
      const parsed = JSON.parse(testimonialsJson) as TestimonialItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const parseGallery = (galleryJson: string): GalleryEntry[] => {
    try {
      const parsed = JSON.parse(galleryJson) as Array<string | Partial<GalleryEntry>>;
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item) => {
        if (typeof item === "string") {
          return {
            url: item,
            type: /\.(mp4|webm|ogg)(\?|#|$)/i.test(item) ? "video" : "image",
            title: "",
            slug: "",
            category: "",
            summary: "",
            description: "",
            images: []
          };
        }

        return {
          url: item.url ?? "",
          type: item.type === "video" ? "video" : "image",
          title: item.title ?? "",
          slug: item.slug ?? "",
          category: item.category ?? "",
          summary: item.summary ?? "",
          description: item.description ?? "",
          images: Array.isArray(item.images) ? item.images : []
        };
      });
    } catch {
      return [];
    }
  };

  const normalizeImportedProject = (payload: GalleryImportPayload): GalleryEntry => {
    const title = (payload.title ?? "").trim();
    const url = (payload.url ?? "").trim();
    const fallbackTitle = title || (url ? "Yangi loyiha" : "Import qilingan loyiha");
    const images = Array.isArray(payload.images)
      ? payload.images
      : Array.isArray(payload.extraImages)
        ? payload.extraImages
        : [];

    return {
      url,
      type: payload.type === "video" ? "video" : "image",
      title: fallbackTitle,
      slug: (payload.slug ?? "").trim() || slugify(fallbackTitle),
      category: payload.category ?? "",
      summary: payload.summary ?? "",
      description: payload.description ?? "",
      images: images.filter(Boolean)
    };
  };

  const importProjectData = (payload: GalleryImportPayload) => {
    const project = normalizeImportedProject(payload);

    if (!project.url) {
      setMessage("Import xato: JSON ichida 'url' bo'lishi kerak.");
      return;
    }

    setGallery((prev) => [...prev, project]);
    setMessage(`Loyiha import qilindi: ${project.title}`);
  };

  useEffect(() => {
    api.get<SiteContent>("/admin/content").then((res) => {
      const { updatedAt, ...rest } = res.data;
      setContent(rest);
      setServices(parseServices(rest.servicesJson));
      setGallery(parseGallery(rest.galleryJson));
      setTestimonials(parseTestimonials(rest.testimonialsJson));
    });
    api.get<User[]>("/admin/users").then((res) => setUsers(res.data));
    api.get<FooterContent>("/admin/footer").then((res) => setFooter(res.data));
    api.get<CustomPage[]>("/admin/pages").then((res) => setPages(Array.isArray(res.data) ? res.data : []));
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
  };

  const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload/media", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data.url as string;
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadMedia(file);

    const fullUrl = `${API_BASE_URL}${uploadedUrl}`;
    setGallery((prev) => [
      ...prev,
      {
        url: uploadedUrl,
        type: file.type.startsWith("video/") ? "video" : "image",
        title: file.name.replace(/\.[^.]+$/, ""),
        slug: slugify(file.name.replace(/\.[^.]+$/, "")),
        category: "",
        summary: "",
        description: "",
        images: [uploadedUrl]
      }
    ]);

    setMessage(`Yuklandi: ${fullUrl}. Endi Saqlash ni bosing.`);
    e.target.value = "";
  };

  const uploadGalleryMain = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedUrl = await uploadMedia(file);

    setGallery((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              url: uploadedUrl,
              type: file.type.startsWith("video/") ? "video" : "image",
              images: item.images?.length ? item.images : [uploadedUrl]
            }
          : item
      )
    );

    setMessage(`${file.name} yuklandi. Endi Saqlash ni bosing.`);
    e.target.value = "";
  };

  const uploadGalleryExtras = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const uploaded = await Promise.all(Array.from(files).map((file) => uploadMedia(file)));

    setGallery((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              images: [...(item.images ?? []), ...uploaded]
            }
          : item
      )
    );

    setMessage(`${uploaded.length} ta qo'shimcha rasm yuklandi.`);
    e.target.value = "";
  };

  const uploadPageHero = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadedUrl = await uploadMedia(file);
    setPages((prev) => prev.map((item, idx) => (idx === index ? { ...item, heroImage: uploadedUrl } : item)));
    setMessage(`${file.name} hero rasmi sifatida yuklandi.`);
    e.target.value = "";
  };

  const uploadPageGallery = async (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const uploaded = await Promise.all(Array.from(files).map((file) => uploadMedia(file)));
    setPages((prev) => prev.map((item, idx) => (idx === index ? { ...item, gallery: [...item.gallery, ...uploaded] } : item)));
    setMessage(`${uploaded.length} ta page rasmi yuklandi.`);
    e.target.value = "";
  };

  const onImportProjectFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as GalleryImportPayload;
      importProjectData(parsed);
    } catch {
      setMessage("Import xato: JSON fayl noto'g'ri formatda.");
    }

    e.target.value = "";
  };

  const onImportProjectLink = async () => {
    const url = projectJsonUrl.trim();
    if (!url) {
      setMessage("Avval JSON link kiriting.");
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        setMessage("Import xato: linkdan JSON olib bo'lmadi.");
        return;
      }

      const parsed = (await response.json()) as GalleryImportPayload;
      importProjectData(parsed);
    } catch {
      setMessage("Import xato: link yoki JSON formatini tekshiring.");
    }
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    setServices((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: string) => {
    setTestimonials((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const updateGallery = (index: number, field: keyof GalleryEntry, value: string) => {
    setGallery((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const updateGalleryImages = (index: number, value: string) => {
    setGallery((prev) => prev.map((item, idx) => (idx === index ? { ...item, images: parseLines(value) } : item)));
  };

  const updateFooterOffice = (index: number, field: "city" | "address", value: string) => {
    setFooter((prev) => ({
      ...prev,
      offices: prev.offices.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    }));
  };

  const updateFooterSocial = (index: number, field: "label" | "url", value: string) => {
    setFooter((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    }));
  };

  const updateFooterValue = (field: keyof Omit<FooterContent, "offices" | "socialLinks">, value: string) => {
    setFooter((prev) => ({ ...prev, [field]: value }));
  };

  const updatePage = (index: number, field: keyof CustomPage, value: string) => {
    setPages((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  };

  const updatePageGallery = (index: number, value: string) => {
    setPages((prev) => prev.map((item, idx) => (idx === index ? { ...item, gallery: parseLines(value) } : item)));
  };

  const addService = () => {
    setServices((prev) => [...prev, { title: "", description: "" }]);
  };

  const addTestimonial = () => {
    setTestimonials((prev) => [...prev, { name: "", text: "" }]);
  };

  const addGallery = () => {
    setGallery((prev) => [...prev, { url: "", type: "image", title: "", slug: "", category: "", summary: "", description: "", images: [] }]);
  };

  const createEmptyPage = (): CustomPage => {
    const id = `page-${Date.now()}`;
    return {
      id,
      slug: id,
      title: "",
      excerpt: "",
      content: "",
      heroImage: "",
      gallery: []
    };
  };

  const addPage = () => {
    setPages((prev) => [...prev, createEmptyPage()]);
  };

  const insertPageAfter = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, createEmptyPage());
      return next;
    });
  };

  const removeService = (index: number) => {
    setServices((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeTestimonial = (index: number) => {
    setTestimonials((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeGallery = (index: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removePage = (index: number) => {
    setPages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      ...content,
      servicesJson: JSON.stringify(services),
      galleryJson: JSON.stringify(gallery),
      testimonialsJson: JSON.stringify(testimonials)
    };

    await Promise.all([
      api.put("/admin/content", payload),
      api.put("/admin/footer", footer),
      api.put("/admin/pages", pages)
    ]);
    setContent(payload);
    setMessage("Muvaffaqiyatli saqlandi");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  return (
    <div className="admin-wrap">
      <div className="admin-hero">
        <div>
          <p className="eyebrow">Control Center</p>
          <h1>Site Builder</h1>
          <p className="admin-subtitle">Barcha sahifa qismlarini, media fayllarni va foydalanuvchilarni shu yerdan boshqarasiz.</p>
        </div>

        <button className="ghost-button" onClick={logout}>Chiqish</button>
      </div>

      <div className="admin-stats">
        <article>
          <span>{users.length}</span>
          <p>Ro'yxatdan o'tganlar</p>
        </article>
        <article>
          <span>{completedFields}</span>
          <p>To'ldirilgan maydonlar</p>
        </article>
        <article>
          <span>{saveReady ? "Ready" : "Draft"}</span>
          <p>Holat</p>
        </article>
      </div>

      <form onSubmit={onSubmit} className="admin-form">
        <div className="admin-grid">
          <label>Company Name<input name="companyName" value={content.companyName} onChange={onChange} /></label>
          <label>Hero Title<input name="heroTitle" value={content.heroTitle} onChange={onChange} /></label>
          <label>Hero Subtitle<input name="heroSubtitle" value={content.heroSubtitle} onChange={onChange} /></label>
          <label>About Title<input name="aboutTitle" value={content.aboutTitle} onChange={onChange} /></label>
          <label className="span-2">About Text<textarea name="aboutText" value={content.aboutText} onChange={onChange} rows={5} /></label>
          <label>Phone<input name="contactPhone" value={content.contactPhone} onChange={onChange} /></label>
          <label>Email<input name="contactEmail" value={content.contactEmail} onChange={onChange} /></label>
          <label>Address<input name="contactAddress" value={content.contactAddress} onChange={onChange} /></label>

          <section className="span-2 editor-section">
            <div className="editor-head">
              <h3>Services</h3>
              <button type="button" className="mini-button" onClick={addService}>+ Qo'shish</button>
            </div>
            <div className="editor-list">
              {services.map((service, index) => (
                <article key={`service-${index}`} className="editor-item">
                  <label>Title<input value={service.title} onChange={(e) => updateService(index, "title", e.target.value)} /></label>
                  <label>Description<textarea rows={3} value={service.description} onChange={(e) => updateService(index, "description", e.target.value)} /></label>
                  <button type="button" className="mini-button danger" onClick={() => removeService(index)}>O'chirish</button>
                </article>
              ))}
              {services.length === 0 ? <p className="muted">Hozircha service yo'q.</p> : null}
            </div>
          </section>

          <section className="span-2 editor-section">
            <div className="editor-head">
              <h3>Gallery (Rasm va Video)</h3>
              <div className="editor-actions">
                <button type="button" className="mini-button" onClick={addGallery}>+ URL qo'shish</button>
                <label className="mini-upload">
                  Fayl yuklash
                  <input type="file" accept="image/*,video/*" onChange={onUpload} />
                </label>
              </div>
            </div>

            <div className="import-panel">
              <div className="field-mode-row">
                <p className="field-mode-label">Loyiha ma'lumotini JSON orqali qo'shish</p>
                <div className="mode-switch">
                  <button type="button" className={`mini-button${projectImportMode === "link" ? " active" : ""}`} onClick={() => setProjectImportMode("link")}>Link</button>
                  <button type="button" className={`mini-button${projectImportMode === "file" ? " active" : ""}`} onClick={() => setProjectImportMode("file")}>Fayl</button>
                </div>
              </div>

              {projectImportMode === "link" ? (
                <div className="import-link-row">
                  <input
                    value={projectJsonUrl}
                    onChange={(e) => setProjectJsonUrl(e.target.value)}
                    placeholder="https://example.com/project.json"
                  />
                  <button type="button" className="mini-button" onClick={onImportProjectLink}>Import</button>
                </div>
              ) : (
                <label className="mini-upload mini-upload--wide">JSON fayl tanlash
                  <input type="file" accept="application/json,.json" onChange={onImportProjectFile} />
                </label>
              )}

              <p className="muted">JSON namuna: url, type, title, slug, category, summary, description, images.</p>
            </div>

            <div className="editor-list">
              {gallery.map((item, index) => (
                <article key={`gallery-${index}`} className="editor-item gallery-item">
                  <div className="field-mode-row">
                    <p className="field-mode-label">Asosiy media manbasi</p>
                    <div className="mode-switch">
                      <button type="button" className={`mini-button${(galleryMainMode[index] ?? "url") === "url" ? " active" : ""}`} onClick={() => setGalleryMainMode((prev) => ({ ...prev, [index]: "url" }))}>URL</button>
                      <button type="button" className={`mini-button${(galleryMainMode[index] ?? "url") === "upload" ? " active" : ""}`} onClick={() => setGalleryMainMode((prev) => ({ ...prev, [index]: "upload" }))}>Fayl</button>
                    </div>
                  </div>

                  {(galleryMainMode[index] ?? "url") === "url" ? (
                    <label>Media URL<input value={item.url} onChange={(e) => updateGallery(index, "url", e.target.value)} /></label>
                  ) : (
                    <label className="mini-upload mini-upload--wide">Media fayl yuklash
                      <input type="file" accept="image/*,video/*" onChange={(e) => uploadGalleryMain(index, e)} />
                    </label>
                  )}

                  <label>Turi
                    <select value={item.type} onChange={(e) => updateGallery(index, "type", e.target.value)}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </label>
                  <label>Nomi<input value={item.title ?? ""} onChange={(e) => updateGallery(index, "title", e.target.value)} /></label>
                  <label>Slug<input value={item.slug ?? ""} onChange={(e) => updateGallery(index, "slug", slugify(e.target.value))} /></label>
                  <label>Kategoriya<input value={item.category ?? ""} onChange={(e) => updateGallery(index, "category", e.target.value)} /></label>
                  <label className="span-2">Qisqa matn<textarea rows={2} value={item.summary ?? ""} onChange={(e) => updateGallery(index, "summary", e.target.value)} /></label>
                  <label className="span-2">Batafsil matn<textarea rows={4} value={item.description ?? ""} onChange={(e) => updateGallery(index, "description", e.target.value)} /></label>

                  <div className="field-mode-row span-2">
                    <p className="field-mode-label">Qo'shimcha rasmlar manbasi</p>
                    <div className="mode-switch">
                      <button type="button" className={`mini-button${(galleryExtraMode[index] ?? "url") === "url" ? " active" : ""}`} onClick={() => setGalleryExtraMode((prev) => ({ ...prev, [index]: "url" }))}>URL</button>
                      <button type="button" className={`mini-button${(galleryExtraMode[index] ?? "url") === "upload" ? " active" : ""}`} onClick={() => setGalleryExtraMode((prev) => ({ ...prev, [index]: "upload" }))}>Fayllar</button>
                    </div>
                  </div>

                  {(galleryExtraMode[index] ?? "url") === "url" ? (
                    <label className="span-2">Qo'shimcha rasmlar (har qatorda bitta URL)
                      <textarea rows={4} value={(item.images ?? []).join("\n")} onChange={(e) => updateGalleryImages(index, e.target.value)} />
                    </label>
                  ) : (
                    <label className="mini-upload mini-upload--wide span-2">Bir yoki bir nechta rasm yuklash
                      <input type="file" accept="image/*" multiple onChange={(e) => uploadGalleryExtras(index, e)} />
                    </label>
                  )}

                  <div className="item-toolbar span-2">
                    <button type="button" className="mini-button danger" onClick={() => removeGallery(index)}>O'chirish</button>
                  </div>
                </article>
              ))}
              {gallery.length === 0 ? <p className="muted">Hozircha gallery bo'sh.</p> : null}
            </div>
          </section>

          <section className="span-2 editor-section">
            <div className="editor-head">
              <h3>Testimonials</h3>
              <button type="button" className="mini-button" onClick={addTestimonial}>+ Qo'shish</button>
            </div>
            <div className="editor-list">
              {testimonials.map((item, index) => (
                <article key={`testimonial-${index}`} className="editor-item">
                  <label>Ism<input value={item.name} onChange={(e) => updateTestimonial(index, "name", e.target.value)} /></label>
                  <label>Matn<textarea rows={3} value={item.text} onChange={(e) => updateTestimonial(index, "text", e.target.value)} /></label>
                  <button type="button" className="mini-button danger" onClick={() => removeTestimonial(index)}>O'chirish</button>
                </article>
              ))}
              {testimonials.length === 0 ? <p className="muted">Hozircha testimonial yo'q.</p> : null}
            </div>
          </section>

          <section className="span-2 editor-section">
            <div className="editor-head">
              <h3>Footer</h3>
            </div>
            <div className="editor-list">
              {footer.offices.map((office, index) => (
                <article key={`office-${index}`} className="editor-item">
                  <label>Shahar<input value={office.city} onChange={(e) => updateFooterOffice(index, "city", e.target.value)} /></label>
                  <label>Manzil<textarea rows={3} value={office.address} onChange={(e) => updateFooterOffice(index, "address", e.target.value)} /></label>
                </article>
              ))}
              <article className="editor-item">
                <label>Telefon<input value={footer.phone} onChange={(e) => updateFooterValue("phone", e.target.value)} /></label>
                <label>Email<input value={footer.email} onChange={(e) => updateFooterValue("email", e.target.value)} /></label>
                <label>Telegram URL<input value={footer.telegramUrl} onChange={(e) => updateFooterValue("telegramUrl", e.target.value)} /></label>
                <label>WhatsApp URL<input value={footer.whatsappUrl} onChange={(e) => updateFooterValue("whatsappUrl", e.target.value)} /></label>
                <label>Privacy label<input value={footer.policyLabel} onChange={(e) => updateFooterValue("policyLabel", e.target.value)} /></label>
                <label>Privacy URL<input value={footer.policyUrl} onChange={(e) => updateFooterValue("policyUrl", e.target.value)} /></label>
                <label>Copyright<input value={footer.copyright} onChange={(e) => updateFooterValue("copyright", e.target.value)} /></label>
              </article>
              {footer.socialLinks.map((item, index) => (
                <article key={`social-${index}`} className="editor-item">
                  <label>Social nomi<input value={item.label} onChange={(e) => updateFooterSocial(index, "label", e.target.value)} /></label>
                  <label>Social URL<input value={item.url} onChange={(e) => updateFooterSocial(index, "url", e.target.value)} /></label>
                </article>
              ))}
            </div>
          </section>

          <section className="span-2 editor-section">
            <div className="editor-head">
              <h3>Custom Pages</h3>
              <button type="button" className="mini-button" onClick={addPage}>+ Page qo'shish</button>
            </div>
            <div className="editor-list">
              {pages.map((page, index) => (
                <article key={page.id} className="editor-item">
                  <div className="item-toolbar">
                    <button type="button" className="mini-button" onClick={() => insertPageAfter(index)}>+ Keyin page qo'shish</button>
                    <button type="button" className="mini-button danger" onClick={() => removePage(index)}>O'chirish</button>
                  </div>
                  <label>Sahifa nomi<input value={page.title} onChange={(e) => updatePage(index, "title", e.target.value)} /></label>
                  <label>Slug<input value={page.slug} onChange={(e) => updatePage(index, "slug", slugify(e.target.value))} /></label>
                  <label>Qisqa izoh<textarea rows={2} value={page.excerpt} onChange={(e) => updatePage(index, "excerpt", e.target.value)} /></label>
                  <label>Asosiy matn<textarea rows={5} value={page.content} onChange={(e) => updatePage(index, "content", e.target.value)} /></label>

                  <div className="field-mode-row">
                    <p className="field-mode-label">Hero rasmi manbasi</p>
                    <div className="mode-switch">
                      <button type="button" className={`mini-button${(pageHeroMode[index] ?? "url") === "url" ? " active" : ""}`} onClick={() => setPageHeroMode((prev) => ({ ...prev, [index]: "url" }))}>URL</button>
                      <button type="button" className={`mini-button${(pageHeroMode[index] ?? "url") === "upload" ? " active" : ""}`} onClick={() => setPageHeroMode((prev) => ({ ...prev, [index]: "upload" }))}>Fayl</button>
                    </div>
                  </div>

                  {(pageHeroMode[index] ?? "url") === "url" ? (
                    <label>Hero image URL<input value={page.heroImage} onChange={(e) => updatePage(index, "heroImage", e.target.value)} /></label>
                  ) : (
                    <label className="mini-upload mini-upload--wide">Hero rasmni yuklash
                      <input type="file" accept="image/*" onChange={(e) => uploadPageHero(index, e)} />
                    </label>
                  )}

                  <div className="field-mode-row">
                    <p className="field-mode-label">Page gallery manbasi</p>
                    <div className="mode-switch">
                      <button type="button" className={`mini-button${(pageGalleryMode[index] ?? "url") === "url" ? " active" : ""}`} onClick={() => setPageGalleryMode((prev) => ({ ...prev, [index]: "url" }))}>URL</button>
                      <button type="button" className={`mini-button${(pageGalleryMode[index] ?? "url") === "upload" ? " active" : ""}`} onClick={() => setPageGalleryMode((prev) => ({ ...prev, [index]: "upload" }))}>Fayllar</button>
                    </div>
                  </div>

                  {(pageGalleryMode[index] ?? "url") === "url" ? (
                    <label>Gallery URLs (har qatorda bitta URL)
                      <textarea rows={4} value={page.gallery.join("\n")} onChange={(e) => updatePageGallery(index, e.target.value)} />
                    </label>
                  ) : (
                    <label className="mini-upload mini-upload--wide">Page gallery rasmlari yuklash
                      <input type="file" accept="image/*" multiple onChange={(e) => uploadPageGallery(index, e)} />
                    </label>
                  )}
                </article>
              ))}
              {pages.length === 0 ? <p className="muted">Hozircha custom page yo'q.</p> : null}
            </div>
          </section>
        </div>

        {message && <p className="ok">{message}</p>}
        <button className={`save-button${saveReady ? " save-button--ready" : ""}`} type="submit">
          {saveReady ? "Saqlash ga tayyor" : "Saqlash"}
        </button>
      </form>

      <section className="users-table-wrap">
        <h2>Ro'yxatdan o'tgan foydalanuvchilar</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ism</th>
              <th>Email</th>
              <th>Role</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
