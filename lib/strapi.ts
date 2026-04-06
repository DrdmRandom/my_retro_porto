type StrapiItem = Record<string, unknown>;

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  repoUrl?: string;
  liveUrl?: string;
  status: "public" | "private";
};

export type WorkExperience = {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
};

type PortfolioData = {
  publicProjects: PortfolioProject[];
  closeProjects: PortfolioProject[];
  experiences: WorkExperience[];
};

const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "https://strapi.cihuy-familly.my.id";

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

function asPlainItem(item: StrapiItem): StrapiItem {
  if (item.attributes && typeof item.attributes === "object" && item.attributes !== null) {
    return { ...item.attributes, id: item.id };
  }
  return item;
}

function toArrayResponse(payload: unknown): StrapiItem[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload.filter((item): item is StrapiItem => typeof item === "object" && item !== null);
  }

  const maybeData = (payload as { data?: unknown }).data;
  if (Array.isArray(maybeData)) {
    return maybeData
      .filter((item): item is StrapiItem => typeof item === "object" && item !== null)
      .map(asPlainItem);
  }

  if (maybeData && typeof maybeData === "object") {
    return [asPlainItem(maybeData as StrapiItem)];
  }

  return [];
}

function pickString(record: StrapiItem, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function pickStringArray(record: StrapiItem, keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0);
    }
    if (typeof value === "string" && value.trim()) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

async function fetchCollection(candidates: string[]): Promise<StrapiItem[]> {
  for (const candidate of candidates) {
    const endpoint = candidate.trim();
    if (!endpoint) continue;

    const base = STRAPI_BASE_URL.endsWith("/") ? STRAPI_BASE_URL.slice(0, -1) : STRAPI_BASE_URL;
    const query = "populate=*&pagination[pageSize]=100&sort=updatedAt:desc";
    const url = `${base}/api/${endpoint}?${query}`;

    try {
      const response = await fetch(url, {
        headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : undefined,
        next: { revalidate: 120 }
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          continue;
        }
        return [];
      }

      const json = (await response.json()) as unknown;
      return toArrayResponse(json);
    } catch {
      continue;
    }
  }

  return [];
}

function resolveProjectStatus(
  item: StrapiItem,
  fallbackStatus: "public" | "private" = "private"
): "public" | "private" {
  const rawStatus = pickString(item, [
    "status",
    "statuss",
    "Statuss",
    "visibility",
    "project_status"
  ]).toLowerCase();
  if (!rawStatus) return fallbackStatus;

  if (
    rawStatus.includes("public") ||
    rawStatus.includes("publish") ||
    rawStatus.includes("published") ||
    rawStatus.includes("live")
  ) {
    return "public";
  }

  if (
    rawStatus.includes("private") ||
    rawStatus.includes("internal") ||
    rawStatus.includes("close") ||
    rawStatus.includes("closed")
  ) {
    return "private";
  }

  return fallbackStatus;
}

function normalizeProject(
  item: StrapiItem,
  fallbackStatus: "public" | "private" = "private"
): PortfolioProject {
  const status = resolveProjectStatus(item, fallbackStatus);

  const fallbackId = `${status}-${pickString(item, ["title", "name", "project_name"], "project")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return {
    id: String(item.id ?? item.documentId ?? fallbackId),
    title: pickString(item, ["title", "name", "project_name"], "Untitled Project"),
    description: pickString(item, ["description", "summary", "about"], "Belum ada deskripsi."),
    tags: pickStringArray(item, ["tags", "tech_stack", "stack", "technologies"]),
    repoUrl: pickString(item, ["repo_url", "repository_url", "github_url", "repository"]),
    liveUrl: pickString(item, ["live_url", "demo_url", "project_url", "published_url"]),
    status
  };
}

function normalizeExperience(item: StrapiItem): WorkExperience {
  const fallbackId = `${pickString(item, ["role", "position", "title"], "role")
    .toLowerCase()
    .replace(/\s+/g, "-")}-${pickString(item, ["company", "organization"], "company")
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return {
    id: String(item.id ?? item.documentId ?? fallbackId),
    role: pickString(item, ["role", "position", "title"], "Role belum diisi"),
    company: pickString(item, ["company", "organization"], "Perusahaan belum diisi"),
    period: pickString(item, ["period", "duration", "date_range"], "Periode belum diisi"),
    location: pickString(item, ["location", "work_type"], "Lokasi belum diisi"),
    summary: pickString(item, ["summary", "description", "responsibility"], "Deskripsi belum diisi")
  };
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const projectCandidates = [
    process.env.STRAPI_PROJECTS_ENDPOINT ?? "projects-dawwi",
    "projects-dawwi",
    "projects-dawwis",
    "portfolio-projects",
    "my-projects"
  ];

  const publicCandidates = [
    process.env.STRAPI_PUBLIC_PROJECTS_ENDPOINT ?? "public-projects",
    "published-projects",
    "projects-public",
    "public-project"
  ];

  const closeCandidates = [
    process.env.STRAPI_CLOSE_PROJECTS_ENDPOINT ?? "close-projects",
    "closed-projects",
    "private-projects",
    "internal-projects"
  ];

  const experienceCandidates = [
    process.env.STRAPI_EXPERIENCES_ENDPOINT ?? "work-experiences-dawwi",
    "work-experiences-dawwi",
    "work-experiences-dawwis",
    "experiences",
    "work-history"
  ];

  const [projectRaw, experienceRaw] = await Promise.all([
    fetchCollection(projectCandidates),
    fetchCollection(experienceCandidates)
  ]);

  if (projectRaw.length > 0) {
    const normalized = projectRaw.map((item) => normalizeProject(item, "private"));
    return {
      publicProjects: normalized.filter((item) => item.status === "public"),
      closeProjects: normalized.filter((item) => item.status === "private"),
      experiences: experienceRaw.map(normalizeExperience)
    };
  }

  const [publicRaw, closeRaw] = await Promise.all([
    fetchCollection(publicCandidates),
    fetchCollection(closeCandidates)
  ]);

  return {
    publicProjects: publicRaw.map((item) => normalizeProject(item, "public")),
    closeProjects: closeRaw.map((item) => normalizeProject(item, "private")),
    experiences: experienceRaw.map(normalizeExperience)
  };
}
