import prisma from "@/lib/prisma";

/**
 * Get all site settings as a key-value map
 */
export async function getAllSiteSettings(): Promise<Record<string, string>> {
    const settings = await prisma.siteSettings.findMany();
    return settings.reduce(
        (acc: Record<string, string>, setting: { key: string; value: string }) => {
            acc[setting.key] = setting.value;
            return acc;
        },
        {} as Record<string, string>
    );
}

/**
 * Get a single site setting by key
 */
export async function getSiteSetting(key: string, fallback = ""): Promise<string> {
    const setting = await prisma.siteSettings.findUnique({ where: { key } });
    return setting?.value ?? fallback;
}

/**
 * Get multiple site settings by keys
 */
export async function getSiteSettings(keys: string[]): Promise<Record<string, string>> {
    const settings = await prisma.siteSettings.findMany({
        where: { key: { in: keys } },
    });
    const result: Record<string, string> = {};
    keys.forEach((key) => {
        result[key] = settings.find((s: { key: string; value: string }) => s.key === key)?.value ?? "";
    });
    return result;
}

/**
 * Update a site setting
 */
export async function updateSiteSetting(key: string, value: string): Promise<void> {
    await prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    });
}

/**
 * Bulk update site settings
 */
export async function bulkUpdateSiteSettings(settings: Record<string, string>): Promise<void> {
    const operations = Object.entries(settings).map(([key, value]) =>
        prisma.siteSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        })
    );
    await prisma.$transaction(operations);
}
