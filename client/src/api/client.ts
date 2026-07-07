import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

type ApiResponse<T> = { data: T };

type ApiClient = {
  get: <T = any>(path: string) => Promise<ApiResponse<T>>;
  post: <T = any>(path: string, payload?: unknown, config?: unknown) => Promise<ApiResponse<T>>;
  put: <T = any>(path: string, payload?: unknown) => Promise<ApiResponse<T>>;
};

type Role = "ADMIN" | "USER";

type LocalUser = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  createdAt: string;
};

type LocalSiteContent = {
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
};

type LocalFooterOffice = {
  city: string;
  address: string;
};

type LocalFooterSocialLink = {
  label: string;
  url: string;
};

type LocalFooterContent = {
  offices: LocalFooterOffice[];
  phone: string;
  email: string;
  telegramUrl: string;
  whatsappUrl: string;
  socialLinks: LocalFooterSocialLink[];
  policyLabel: string;
  policyUrl: string;
  copyright: string;
};

const LOCAL_USERS_KEY = "hotwalls_local_users";
const LOCAL_CONTENT_KEY = "hotwalls_local_content";
const LOCAL_FOOTER_KEY = "hotwalls_local_footer";

const LOCAL_ADMIN_EMAIL = "admin@hotwalls.uz";
const LOCAL_ADMIN_PASSWORD = "Admin12345";

const getNowIso = () => new Date().toISOString();

const getDefaultLocalUsers = (): LocalUser[] => [
  {
    id: 1,
    name: "Administrator",
    email: LOCAL_ADMIN_EMAIL,
    password: LOCAL_ADMIN_PASSWORD,
    role: "ADMIN",
    createdAt: getNowIso()
  }
];

const getDefaultLocalContent = (): LocalSiteContent => ({
  id: 1,
  companyName: "HOT WALLS",
  heroTitle: "Zamonaviy Issiqlik Va Fasad Yechimlari",
  heroSubtitle: "Premium dizayn, mustahkam material va professional montaj.",
  heroVideoUrl: "",
  aboutTitle: "Biz Haqimizda",
  aboutText: "Issiqlik va fasad bo'yicha professional xizmatlar.",
  servicesJson: JSON.stringify([
    { title: "Fasad Panellari", description: "Bardoshli va estetik tashqi qoplama yechimlari." },
    { title: "Issiqlik Izolyatsiyasi", description: "Energiya tejamkor va uzoq muddatli izolyatsiya." },
    { title: "Professional Montaj", description: "Mutaxassislar tomonidan tez va sifatli o'rnatish." }
  ]),
  galleryJson: JSON.stringify([
    {
      url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      type: "image",
      title: "Interyer Premium Panel",
      slug: "interyer-premium-panel",
      category: "Interyer",
      summary: "Ichki makon uchun issiq va zamonaviy devor yechimi.",
      description: "Bu loyiha interyer panel dizayni, material sifati va o'rnatish yakuniy ko'rinishini ko'rsatadi.",
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
      ]
    },
    {
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      type: "image",
      title: "Fasad Light Stone",
      slug: "fasad-light-stone",
      category: "Eksteryer",
      summary: "Tashqi fasad uchun toza va bardoshli finish.",
      description: "Fasad loyihasi turli burchaklardan ko'rinish, tekstura va umumiy arxitektura uyg'unligini ochib beradi.",
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
      ]
    }
  ]),
  testimonialsJson: JSON.stringify([{ name: "Mijoz", text: "Xizmat sifati yuqori." }]),
  contactPhone: "+998 90 000 00 00",
  contactEmail: "info@hotwalls.uz",
  contactAddress: "Toshkent, O'zbekiston",
  contactTelegram: "https://t.me/hotwalls",
  contactInstagram: "https://instagram.com/hotwalls",
  contactExtraLabel: "YouTube",
  contactExtraUrl: "https://youtube.com",
  updatedAt: getNowIso()
});

const getDefaultLocalFooter = (): LocalFooterContent => ({
  offices: [
    {
      city: "Moskva",
      address: "Xolodilniy ko'chasi, 3, 1-bino, 8-bino, 2-qavat, 8217-ofis"
    },
    {
      city: "Sankt-Peterburg",
      address: "11-chi Krasnoarmeyskaya, 18-20, 102-kabi"
    }
  ],
  phone: "+7 (495) 129-99-50",
  email: "info@hot-walls.ru",
  telegramUrl: "https://t.me/hotwalls",
  whatsappUrl: "https://wa.me/74951299950",
  socialLinks: [
    { label: "VK", url: "https://vk.com" },
    { label: "Telegram", url: "https://t.me/hotwalls" }
  ],
  policyLabel: "Maxfiylik siyosati",
  policyUrl: "#",
  copyright: "© “issiq devorlar”, 2013 — 2026"
});

const normalizeLocalContent = (content: LocalSiteContent): LocalSiteContent => {
  const defaultContent = getDefaultLocalContent();
  const withDefaults: LocalSiteContent = {
    ...defaultContent,
    ...content
  };

  try {
    const parsed = JSON.parse(withDefaults.galleryJson) as Array<string | Partial<{
      url: string;
      type: "image" | "video";
      title: string;
      slug: string;
      category: string;
      summary: string;
      description: string;
      images: string[];
    }>>;

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return {
        ...withDefaults,
        galleryJson: defaultContent.galleryJson
      };
    }

    const normalized = parsed.map((item, index) => {
      const defaultItem = JSON.parse(defaultContent.galleryJson)[index] ?? {};

      if (typeof item === "string") {
        const baseTitle = `Loyiha ${index + 1}`;
        return {
          url: item,
          type: /\.(mp4|webm|ogg)(\?|#|$)/i.test(item) ? "video" : "image",
          title: baseTitle,
          slug: `loyiha-${index + 1}`,
          category: "Loyiha",
          summary: "Batafsil ko'rish",
          description: "Tanlangan loyiha haqida batafsil ma'lumot.",
          images: [item]
        };
      }

      const title = item.title || defaultItem.title || `Loyiha ${index + 1}`;
      return {
        url: item.url || defaultItem.url || "",
        type: item.type === "video" ? "video" : (item.type || defaultItem.type || "image"),
        title,
        slug: item.slug || defaultItem.slug || title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"),
        category: item.category || defaultItem.category || "Loyiha",
        summary: item.summary || defaultItem.summary || "Batafsil ko'rish",
        description: item.description || defaultItem.description || "Tanlangan loyiha haqida batafsil ma'lumot.",
        images: Array.isArray(item.images) && item.images.length ? item.images : (defaultItem.images || [item.url || defaultItem.url]).filter(Boolean)
      };
    });

    return {
      ...withDefaults,
      galleryJson: JSON.stringify(normalized)
    };
  } catch {
    return {
      ...withDefaults,
      galleryJson: defaultContent.galleryJson
    };
  }
};

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const initLocalData = () => {
  const users = readJson<LocalUser[]>(LOCAL_USERS_KEY, []);
  if (!users.length) {
    writeJson(LOCAL_USERS_KEY, getDefaultLocalUsers());
  }

  const content = readJson<LocalSiteContent | null>(LOCAL_CONTENT_KEY, null);
  if (!content) {
    writeJson(LOCAL_CONTENT_KEY, getDefaultLocalContent());
  } else {
    writeJson(LOCAL_CONTENT_KEY, normalizeLocalContent(content));
  }

  const footer = readJson<LocalFooterContent | null>(LOCAL_FOOTER_KEY, null);
  if (!footer) {
    writeJson(LOCAL_FOOTER_KEY, getDefaultLocalFooter());
  }
};

const getLocalUsers = () => readJson<LocalUser[]>(LOCAL_USERS_KEY, getDefaultLocalUsers());

const setLocalUsers = (users: LocalUser[]) => {
  writeJson(LOCAL_USERS_KEY, users);
};

const getLocalContent = () => normalizeLocalContent(readJson<LocalSiteContent>(LOCAL_CONTENT_KEY, getDefaultLocalContent()));

const setLocalContent = (content: LocalSiteContent) => {
  writeJson(LOCAL_CONTENT_KEY, content);
};

const getLocalFooter = () => readJson<LocalFooterContent>(LOCAL_FOOTER_KEY, getDefaultLocalFooter());

const setLocalFooter = (footer: LocalFooterContent) => {
  writeJson(LOCAL_FOOTER_KEY, footer);
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File read error"));
    reader.readAsDataURL(file);
  });

const makeResponse = async <T>(factory: () => T | Promise<T>): Promise<ApiResponse<T>> => {
  const data = await factory();
  return { data };
};

const createLocalApi = (): ApiClient => {
  initLocalData();

  return {
    async get<T = any>(path: string): Promise<ApiResponse<T>> {
      if (path === "/public/content") {
        return makeResponse(() => getLocalContent() as T);
      }

      if (path === "/admin/content") {
        return makeResponse(() => getLocalContent() as T);
      }

      if (path === "/admin/users") {
        return makeResponse(
          () =>
            getLocalUsers().map((user) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              createdAt: user.createdAt
            })) as T
        );
      }

      if (path === "/public/footer" || path === "/admin/footer") {
        return makeResponse(() => getLocalFooter() as T);
      }

      throw new Error(`Unsupported GET path: ${path}`);
    },

    async post<T = any>(path: string, payload?: unknown): Promise<ApiResponse<T>> {
      if (path === "/auth/login") {
        const body = (payload || {}) as { email?: string; phone?: string; password?: string };
        const loginKey = (body.email || body.phone || "").toLowerCase();
        const user = getLocalUsers().find(
          (item) => (item.email.toLowerCase() === loginKey || (item.phone ?? "").toLowerCase() === loginKey) && item.password === body.password
        );

        if (!user) {
          throw new Error("Invalid credentials");
        }

        return makeResponse(
          () =>
            ({
              token: `local-token-${user.id}`,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            }) as T
        );
      }

      if (path === "/auth/register") {
        const body = (payload || {}) as { name?: string; email?: string; phone?: string; password?: string; role?: Role };
        const users = getLocalUsers();

        if ((!body.email && !body.phone) || !body.password || !body.name) {
          throw new Error("Invalid payload");
        }

        const normalizedPhone = (body.phone || "").replace(/\s+/g, "").trim();
        const derivedEmail = body.email || (normalizedPhone ? `${normalizedPhone}@phone.hotwalls.local` : "");

        if (!derivedEmail) {
          throw new Error("Invalid payload");
        }

        const exists = users.some(
          (item) => item.email.toLowerCase() === derivedEmail.toLowerCase() || (!!normalizedPhone && (item.phone ?? "") === normalizedPhone)
        );
        if (exists) {
          throw new Error("Email already exists");
        }

        const next: LocalUser = {
          id: users.length ? Math.max(...users.map((item) => item.id)) + 1 : 1,
          name: body.name,
          email: derivedEmail,
          phone: normalizedPhone || undefined,
          password: body.password,
          role: body.role === "ADMIN" ? "ADMIN" : "USER",
          createdAt: getNowIso()
        };

        setLocalUsers([...users, next]);

        return makeResponse(
          () =>
            ({
              token: `local-token-${next.id}`,
              user: {
                id: next.id,
                name: next.name,
                email: next.email,
                role: next.role
              }
            }) as T
        );
      }

      if (path === "/auth/google") {
        const body = (payload || {}) as { email?: string; name?: string };
        const rawEmail = (body.email || "").trim().toLowerCase();
        const googleEmail = rawEmail.endsWith("@gmail.com") ? rawEmail : "";

        if (!googleEmail) {
          throw new Error("Google email is required");
        }

        const users = getLocalUsers();
        let user = users.find((item) => item.email.toLowerCase() === googleEmail);

        if (!user) {
          user = {
            id: users.length ? Math.max(...users.map((item) => item.id)) + 1 : 1,
            name: body.name?.trim() || "Google User",
            email: googleEmail,
            password: "google-oauth",
            role: "USER",
            createdAt: getNowIso()
          };
          setLocalUsers([...users, user]);
        }

        return makeResponse(
          () =>
            ({
              token: `local-token-${user.id}`,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
              }
            }) as T
        );
      }

      if (path === "/upload/media") {
        const formData = payload as FormData;
        const file = formData?.get("file");
        if (!(file instanceof File)) {
          throw new Error("File is required");
        }

        return makeResponse(async () => ({ url: await fileToDataUrl(file) } as T));
      }

      throw new Error(`Unsupported POST path: ${path}`);
    },

    async put<T = any>(path: string, payload?: unknown): Promise<ApiResponse<T>> {
      if (path === "/admin/content") {
        const current = getLocalContent();
        const body = (payload || {}) as Partial<LocalSiteContent>;
        const updated: LocalSiteContent = {
          ...current,
          ...body,
          updatedAt: getNowIso()
        };

        setLocalContent(updated);
        return makeResponse(() => updated as T);
      }

      if (path === "/admin/footer") {
        const updated = payload as LocalFooterContent;
        setLocalFooter(updated);
        return makeResponse(() => updated as T);
      }

      throw new Error(`Unsupported PUT path: ${path}`);
    }
  };
};

const isLocalMode = !API_BASE_URL;

const createRemoteApi = (): ApiClient => {
  const axiosClient = axios.create({
    baseURL: `${API_BASE_URL}/api`
  });

  const withToken = (config?: Record<string, unknown>) => {
    const token = localStorage.getItem("token");
    return {
      ...(config || {}),
      headers: {
        ...((config?.headers as Record<string, string> | undefined) || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };
  };

  return {
    async get<T = any>(path: string) {
      const res = await axiosClient.get<T>(path, withToken());
      return { data: res.data };
    },
    async post<T = any>(path: string, payload?: unknown, config?: unknown) {
      const res = await axiosClient.post<T>(path, payload, withToken(config as Record<string, unknown> | undefined));
      return { data: res.data };
    },
    async put<T = any>(path: string, payload?: unknown) {
      const res = await axiosClient.put<T>(path, payload, withToken());
      return { data: res.data };
    }
  };
};

export const api: ApiClient = isLocalMode ? createLocalApi() : createRemoteApi();
