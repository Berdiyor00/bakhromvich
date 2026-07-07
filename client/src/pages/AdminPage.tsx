import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api, API_BASE_URL } from "../api/client";
import type { ServiceItem, SiteContent, TestimonialItem, User } from "../types";

type GalleryEntry = {
  url: string;
  type: "image" | "video";
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

export default function AdminPage() {
  const [content, setContent] = useState(emptyContent);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const primitiveFilled = [
    content.companyName,
    content.heroTitle,
    content.heroSubtitle,
    content.heroVideoUrl,
    content.aboutTitle,
    content.aboutText,
    content.contactPhone,
    content.contactEmail,
    content.contactAddress
  ].filter((item) => item.trim().length > 0).length;

  const completedFields = primitiveFilled + (services.length > 0 ? 1 : 0) + (gallery.length > 0 ? 1 : 0) + (testimonials.length > 0 ? 1 : 0);
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
      const parsed = JSON.parse(galleryJson) as Array<string | { url: string; type?: "image" | "video" }>;
      if (!Array.isArray(parsed)) return [];

      return parsed.map((item) => {
        if (typeof item === "string") {
          return {
            url: item,
            type: /\.(mp4|webm|ogg)(\?|#|$)/i.test(item) ? "video" : "image"
          };
        }

        return {
          url: item.url,
          type: item.type === "video" ? "video" : "image"
        };
      });
    } catch {
      return [];
    }
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
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent((prev) => ({ ...prev, [name]: value }));
  };

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload/media", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const fullUrl = `${API_BASE_URL}${res.data.url}`;
    setGallery((prev) => [
      ...prev,
      {
        url: res.data.url,
        type: file.type.startsWith("video/") ? "video" : "image"
      }
    ]);

    setMessage(`Yuklandi: ${fullUrl}. Endi Saqlash ni bosing.`);
    e.target.value = "";
  };

  const onHeroUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/upload/media", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    setContent((prev) => ({
      ...prev,
      heroVideoUrl: res.data.url
    }));

    setMessage(`Hero video yuklandi: ${API_BASE_URL}${res.data.url}. Endi Saqlash ni bosing.`);
    e.target.value = "";
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

  const addService = () => {
    setServices((prev) => [...prev, { title: "", description: "" }]);
  };

  const addTestimonial = () => {
    setTestimonials((prev) => [...prev, { name: "", text: "" }]);
  };

  const addGallery = () => {
    setGallery((prev) => [...prev, { url: "", type: "image" }]);
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

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      ...content,
      servicesJson: JSON.stringify(services),
      galleryJson: JSON.stringify(gallery),
      testimonialsJson: JSON.stringify(testimonials)
    };

    await api.put("/admin/content", payload);
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
          <label>Hero Video URL<input name="heroVideoUrl" value={content.heroVideoUrl} onChange={onChange} /></label>
          <label>Hero video yuklash<input type="file" accept="video/*" onChange={onHeroUpload} /></label>
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
            <div className="editor-list">
              {gallery.map((item, index) => (
                <article key={`gallery-${index}`} className="editor-item gallery-item">
                  <label>Media URL<input value={item.url} onChange={(e) => updateGallery(index, "url", e.target.value)} /></label>
                  <label>Turi
                    <select value={item.type} onChange={(e) => updateGallery(index, "type", e.target.value)}>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </label>
                  <button type="button" className="mini-button danger" onClick={() => removeGallery(index)}>O'chirish</button>
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
