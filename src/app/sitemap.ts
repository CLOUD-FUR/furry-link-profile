import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://fluffy-link.xyz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");

  const now = new Date();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/user`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/questions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/register`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 동적 프로필 페이지 (공개 유저만)
  let dynamicPages: MetadataRoute.Sitemap = [];
  try {
    const users = await prisma.user.findMany({
      where: { isPublic: true },
      select: {
        handle: true,
        updatedAt: true,
      },
    });

    dynamicPages = users.map((u) => ({
      url: `${base}/@${encodeURIComponent(u.handle)}`,
      lastModified: u.updatedAt ?? now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB 오류 시 정적 페이지만 반환
    dynamicPages = [];
  }

  return [...staticPages, ...dynamicPages];
}
