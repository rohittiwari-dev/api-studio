import { MetadataRoute } from 'next';
import { APP_URL } from '@/constants';

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = APP_URL;

	// Static pages
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 1,
		},
		{
			url: `${baseUrl}/login`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/register`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
	];

	return staticPages;
}
