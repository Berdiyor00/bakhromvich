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
  updatedAt: string;
};

const LOCAL_USERS_KEY = "hotwalls_local_users";
const LOCAL_CONTENT_KEY = "hotwalls_local_content";

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
  galleryJson: "[]",
  testimonialsJson: JSON.stringify([{ name: "Mijoz", text: "Xizmat sifati yuqori." }]),
  contactPhone: "+998 90 000 00 00",
  contactEmail: "info@hotwalls.uz",
  contactAddress: "Toshkent, O'zbekiston",
  updatedAt: getNowIso()
});

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
  }
};

const getLocalUsers = () => readJson<LocalUser[]>(LOCAL_USERS_KEY, getDefaultLocalUsers());

const setLocalUsers = (users: LocalUser[]) => {
  writeJson(LOCAL_USERS_KEY, users);
};

const getLocalContent = () => readJson<LocalSiteContent>(LOCAL_CONTENT_KEY, getDefaultLocalContent());

const setLocalContent = (content: LocalSiteContent) => {
  writeJson(LOCAL_CONTENT_KEY, content);
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

      throw new Error(`Unsupported GET path: ${path}`);
    },

    async post<T = any>(path: string, payload?: unknown): Promise<ApiResponse<T>> {
      if (path === "/auth/login") {
        const body = (payload || {}) as { email?: string; password?: string };
        const user = getLocalUsers().find((item) => item.email === body.email && item.password === body.password);

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
        const body = (payload || {}) as { name?: string; email?: string; password?: string; role?: Role };
        const users = getLocalUsers();

        if (!body.email || !body.password || !body.name) {
          throw new Error("Invalid payload");
        }

        const exists = users.some((item) => item.email.toLowerCase() === body.email!.toLowerCase());
        if (exists) {
          throw new Error("Email already exists");
        }

        const next: LocalUser = {
          id: users.length ? Math.max(...users.map((item) => item.id)) + 1 : 1,
          name: body.name,
          email: body.email,
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
