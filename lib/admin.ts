export function getAdminIds(): string[] {
  const raw = process.env.ADMIN_DISCORD_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isAdminId(id?: string | null): boolean {
  if (!id) return false;
  return getAdminIds().includes(id);
}


export function getAdminIds(): string[] {
  const raw = process.env.ADMIN_DISCORD_IDS ?? "";
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Always include the owner admin id unless explicitly removed (not supported)
  const set = new Set<string>([DEFAULT_ADMIN, ...fromEnv]);
  return Array.from(set);
}

export function isAdminId(id: string | null | undefined): boolean {
  if (!id) return false;
  return getAdminIds().includes(id);
}
