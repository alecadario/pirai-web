import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/crm', '/marca', '/insights', '/perfil', '/plan', '/cv', '/empleos', '/cursos', '/login'] },
    ],
    sitemap: 'https://pirai.es/sitemap.xml',
  };
}
