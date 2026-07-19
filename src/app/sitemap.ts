import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://pirai.es', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://pirai.es/webinars', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: 'https://pirai.es/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://pirai.es/terminos', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://pirai.es/aviso-legal', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://pirai.es/cookies', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
