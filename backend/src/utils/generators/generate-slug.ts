export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateSlug(
  name: string,
  slugExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = slugify(name) || 'campeonato';
  let slug = baseSlug;
  let suffix = 1;

  while (await slugExists(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}
